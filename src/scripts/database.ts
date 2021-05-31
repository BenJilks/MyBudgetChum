
class DataBase
{

    private static instance: DataBase = null

    private database: IDBDatabase

    // NOTE: Stores any tables that are currently being made,
    //       this is just to assure we don't use it in that state.
    private is_transaction_in_progress: boolean
    private notify_when_transaction_is_done: (() => void)[]
    private notify_when_database_is_ready: (() => void)[]

    private create_new_database(event: IDBVersionChangeEvent)
    {
        const database: IDBDatabase = (event.target as any).result

        const categories = database.createObjectStore('categories', { keyPath: 'name' })
        categories.transaction.oncomplete = () =>
        {
            this.init_database(database)
        }
    }

    private ensure_database_is_ready(): Promise<void>
    {
        return new Promise((resolve) =>
        {
            if (this.database != null)
            {
                resolve()
                return
            }

            this.notify_when_database_is_ready.push(() => resolve())
        })
    }

    private create_transaction(
            table: string, mode: IDBTransactionMode, 
            success?: () => void, error?: (code: any) => void)
        : Promise<IDBTransaction>
    {
        return new Promise(async (resolve) =>
        {
            await this.ensure_database_is_ready()

            const start_transaction = () =>
            {
                this.is_transaction_in_progress = true
                const on_transaction_done = () =>
                {
                    this.is_transaction_in_progress = false
                    this.notify_when_transaction_is_done.forEach((resolve) => resolve())
                    this.notify_when_transaction_is_done = []
                }

                const transaction = this.database.transaction([table], mode)
                transaction.onerror = (event: Event) => 
                {
                    on_transaction_done()
                    if (error)
                        error((event.target as any).errorCode)
                }
                transaction.oncomplete = () => 
                {
                    on_transaction_done()
                    if (success)
                        success()
                }
                resolve(transaction)
            }

            // NOTE: If there's no transaction in progress, we can just make one right now, 
            //       otherwise we'll have to wait until it's finished
            if (!this.is_transaction_in_progress)
                start_transaction()
            else
                this.notify_when_transaction_is_done.push(() => start_transaction())
        })
    }

    public insert(table: string, item: object): Promise<void>
    {
        return new Promise(async (resolve, reject) =>
        {
            const success = () => resolve()
            const error = (code) => reject(code)

            const transaction = await this.create_transaction(table, "readwrite", success, error)
            const store_object = transaction.objectStore(table)
            store_object.add(item)
        })
    }

    public get<T>(table: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]>
    {
        return new Promise(async (resolve, reject) =>
        {
            const transaction = await this.create_transaction(table, "readonly")
            const store_object = transaction.objectStore(table)
            const request = store_object.getAll(query)
            request.onerror = () => reject()
            request.onsuccess = () => resolve(request.result as T[])
        })
    }

    private init_database(database: IDBDatabase)
    {
        this.database = database
        this.database.onerror = (event) =>
        {
            // TODO: Do something more sensible here
            console.log(`Database error ${ (event.target as any).errorCode }`)
        }

        // Tell everyone that the database is ready to use
        if (this.notify_when_database_is_ready != null)
        {
            this.notify_when_database_is_ready.forEach((resolve) => resolve())
            this.notify_when_database_is_ready = null
        }
    }

    private constructor()
    {
        this.is_transaction_in_progress = false
        this.notify_when_transaction_is_done = []
        this.notify_when_database_is_ready = []

        if (!window.indexedDB) 
        {
            // TODO: Do something more sensible here
            alert('IndexedDB not supported')
            return
        }

        const request = window.indexedDB.open('mybudgetingchum', 3)
        request.onerror = () =>
        {
            // TODO: Do something more sensible here
            alert(`Unable to connect to database ${ request.error }`)
        }
        request.onsuccess = () => this.init_database(request.result)
        request.onupgradeneeded = (event) => this.create_new_database(event)
    }

    public static the(): DataBase
    {
        if (DataBase.instance == null)
            DataBase.instance = new DataBase()
        return DataBase.instance
    }

}
