
class DataBase
{

    private static instance: DataBase = null

    private database: IDBDatabase

    // NOTE: Stores any tables that are currently being made,
    //       this is just to assure we don't use it in that state.
    private not_ready: Map<string, (() => void)[]>
    private notify_when_database_is_ready: (() => void)[]

    private create_new_database(event: IDBVersionChangeEvent)
    {
        const database: IDBDatabase = (event.target as any).result

        this.not_ready.set('categories', [])
        const categories = database.createObjectStore('categories', { keyPath: 'name' })
        categories.transaction.oncomplete = () =>
        {
            this.not_ready.get('categories').forEach((resolve) => resolve())
            this.not_ready.delete('categories')
        }

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

    private ensure_table_is_ready(table: string): Promise<void>
    {
        return new Promise(async (resolve) =>
        {
            await this.ensure_database_is_ready()

            if (!this.not_ready.has(table))
            {
                resolve()
                return
            }

            this.not_ready.get(table).push(() => resolve())
        })
    }

    public insert(table: string, item: object): Promise<void>
    {
        return new Promise(async (resolve, reject) =>
        {
            await this.ensure_table_is_ready(table)

            const transaction = this.database.transaction([table], "readwrite")
            transaction.onerror = () => reject()
            transaction.oncomplete = () => resolve(null)

            const store_object = transaction.objectStore(table)
            console.log(item)
            store_object.add(item)
        })
    }

    public get<T>(table: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]>
    {
        return new Promise(async (resolve, reject) =>
        {
            await this.ensure_table_is_ready(table)

            const transaction = this.database.transaction([table], "readonly")
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
            alert(`Database error ${ (event.target as any).errorCode }`)
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
        this.not_ready = new Map()
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
