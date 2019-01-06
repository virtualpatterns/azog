
import Migration from '../library/migration'

const migrationPrototype = Migration.getMigrationPrototype()
const migration = Object.create(migrationPrototype)

migration.install = async function () {

  let query = 'update resource \
               set    deleted = current_timestamp \
               where  "fromName" = "toName" and \
                      deleted is null;'

  await this.connection.query(query)

  query = 'alter table    resource \
           add constraint "resourceConstraint" \
           check          ( "fromName" <> "toName" and \
                            deleted is null or \
                            not deleted is null );'

  await this.connection.query(query)
  await migrationPrototype.install.call(this)

}

migration.uninstall = async function ()  {

  let query = 'alter table      resource \
               drop constraint  "resourceConstraint";'

  await this.connection.query(query)

  query = 'update resource \
           set    deleted = null \
           where  "fromName" = "toName" and \
                  not deleted is null;'

  await this.connection.query(query)
  await migrationPrototype.uninstall.call(this)

}

export default migration

/*
update resource set deleted = now where "fromName" = "toName"

alter table resource add CONSTRAINT "resourceConstraint" CHECK ("fromName" <> "toName" and deleted is null or not deleted is null )

  let query = 'insert into resource ( "fromName", \
                                      "toName" ) \
               values               ( $1, \
                                      $2 ) \
               on conflict \
               on constraint "resourceKey" \
               do update \
               set  inserted = current_timestamp, \
                    deleted = null
                on constraint "resourceConstraint";
                do nothing;'

*/
