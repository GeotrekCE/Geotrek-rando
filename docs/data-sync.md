# Geotrek-rando documentation

‹ Back to [README](README.md)

## Synchronize data

You have to set up a data directory on the Geotrek-Rando server and synchronize it with Geotrek-Admin data.
To do so, you have to run the Geotrek-Admin command (`<...>` has to be replaced by your actual configuration):

```
./bin/django sync_rando -v2 --url <http://url_of_my_geotrek_admin_serveur> <my_data_directory>
```

If Geotrek-Admin and Geotrek-Rando are not on the same server, you have to transfer data by your own (ftp, ssh, usb key…).
If you want to synchronize automatically every night, you can configure a cron task.
Make sure access rights will allow nginx to read all files in `<my_data_directory>`.
