
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'select  pg_constraint.conname as "constraintName" \
               from    pg_constraint \
                         inner join pg_class on \
                           pg_constraint.conrelid = pg_class.oid and \
                           pg_class.relname = \'resource\' and \
                           pg_constraint.contype = \'p\';'

  let response = await this.connection.query(query)
  let constraintName = response.rows[0].constraintName                                          
                                            
  if (constraintName != 'resourceKey') {

    query = 'alter table resource rename constraint "resourcePrimaryKey" to "resourceKey";'

    await this.connection.query(query)

  }

  await migrationPrototype.install.call(this)

}

export default migration
