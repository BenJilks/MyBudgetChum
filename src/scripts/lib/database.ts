
export class DataBase
{

    private static instance: DataBase = null

    private database: IDBDatabase

    // NOTE: Stores any tables that are currently being made,
    //       this is just to assure we don't use it in that state.
    private is_transaction_in_progress: boolean
    private notify_when_transaction_is_done: (() => void)[]
    private notify_when_database_is_ready: (() => void)[]

    private async create_new_database(event: IDBVersionChangeEvent)
    {
        const database: IDBDatabase = (event.target as any).result

        const create_table = (table: string, key?: string) =>
        {
            return new Promise((resolve) =>
            {
                const store =
                    key == null
                    ? database.createObjectStore(table, { autoIncrement : true })
                    : database.createObjectStore(table, { keyPath: key })

                store.transaction.oncomplete = () => resolve(null)
            })
        }

        await Promise.all(
        [ 
            create_table('categories', 'name'),
            create_table('places', 'name'),
            create_table('transactions', 'timestamp'),
            create_table('repeat'),
            create_table('config', 'key'),
        ])
        this.init_database(database)
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

    private wait_for_transaction(): Promise<() => void>
    {
        return new Promise(async (resolve) =>
        {
            await this.ensure_database_is_ready()

            const start_transaction = () =>
            {
                this.is_transaction_in_progress = true
                const on_transaction_done = () =>
                {
                    // Nobody is waiting, so just leave
                    if (this.notify_when_transaction_is_done.length == 0)
                    {
                        this.is_transaction_in_progress = false
                        return
                    }

                    // Notify the next person waiting that their ready to go
                    const next = this.notify_when_transaction_is_done[this.notify_when_transaction_is_done.length - 1]
                    this.notify_when_transaction_is_done.pop()
                    next()
                }

                resolve(on_transaction_done)
            }

            // NOTE: If there's no transaction in progress, we can just make one right now, 
            //       otherwise we'll have to wait until it's finished
            if (!this.is_transaction_in_progress)
                start_transaction()
            else
                this.notify_when_transaction_is_done.push(() => start_transaction())
        })
    }

    private do_request<T>(table: string, mode: IDBTransactionMode, 
        on_request: (IDBObjectStore) => IDBRequest, on_result: (IDBRequest) => T): Promise<T>
    {
        return new Promise(async (resolve, reject) =>
        {
            const on_done = await this.wait_for_transaction()
            const transaction = this.database.transaction([table], mode)
            transaction.onerror = (event: Event) => on_done()
            transaction.oncomplete = () => on_done()

            const store_object = transaction.objectStore(table)
            const request = on_request(store_object)
            request.onerror = () => reject()
            request.onsuccess = () => resolve(on_result(request))
        })
    }

    public insert(table: string, item: object): Promise<any>
    {
        return this.do_request(table, 'readwrite',
            store => store.add(item), 
            request => request.result)
    }

    public get(table: string, query?: IDBValidKey | IDBKeyRange): Promise<any[]>
    {
        return this.do_request(table, 'readonly',
            store => store.getAll(query), 
            request => request.result)
    }

    public getKeys(table: string, query?: IDBValidKey | IDBKeyRange): Promise<any>
    {
        return this.do_request(table, 'readonly',
            store => store.getAllKeys(query), 
            request => request.result)
    }

    public update(table: string, item: object, key?: IDBValidKey): Promise<void>
    {
        return this.do_request(table, 'readwrite',
            store => store.put(item, key),
            () => null)
    }

    public remove(table: string, key: IDBValidKey): Promise<void>
    {
        return this.do_request(table, 'readwrite',
            store => store.delete(key),
            () => null)
    }

    private init_database(database: IDBDatabase)
    {
        this.database = database
        this.database.onerror = (event) =>
        {
            // TODO: Do something more sensible here
            console.error(`Database error ${ event.target }`)
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
            console.error('IndexedDB not supported')
            return
        }

        const request = window.indexedDB.open('mybudgetingchum', 3)
        request.onerror = () =>
        {
            // TODO: Do something more sensible here
            console.error(`Unable to connect to database ${ request.error }`)
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