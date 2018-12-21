
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  if (await this.connection.existsTable('migration')) {

    /*
      select  pg_class.relname      as "tableName",
              pg_constraint.conname as "constraintName",
              pg_constraint.contype as "constraintType"
      from    pg_constraint 
                inner join pg_class on 
                  pg_constraint.conrelid = pg_class.oid and 
                  pg_class.relname = 'migration';
    */

    let query = 'alter table migration rename constraint migration_pkey to "migrationKey";'

    await this.connection.query(query)
    await migrationPrototype.install.call(this)

    /*

      select  min(migration.inserted) - interval '1 day' as inserted
      from    migration

      update  migration
      set     migration.inserted = (above)
      from    migration
      where   migration.path = this.path

    */

    query = 'select  min(migration.inserted) - interval \'1 day\' as inserted \
             from    migration;'

    let response = await this.connection.query(query)
    let inserted = response.rows[0].inserted

    query = 'update  migration \
             set     inserted = $2 \
             where   path = $1;'

    let values = [ this.path, inserted ]
     
    await this.connection.query(query, values)

  }
  else {

    let query = 'create table migration ( path text not null, \
                                          inserted timestamp not null default current_timestamp, \
                                          deleted timestamp default null, \
                                          constraint "migrationKey" primary key ( path ) );'

    await this.connection.query(query)
    await migrationPrototype.install.call(this)

  }

}

migration.uninstall = async function ()  {

  let query = 'drop table migration;'

  // This is the only time these are done in this order
  await migrationPrototype.uninstall.call(this)
  await this.connection.query(query)

}

export default migration
