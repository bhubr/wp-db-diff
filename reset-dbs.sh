#!/bin/bash
docker exec -it db-diff_db_1 mysql -uroot -psomewordpress -e "drop database lesvaguavtold; CREATE DATABASE lesvaguavtold CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
docker exec -it db-diff_db_1 mysql -uroot -psomewordpress -e "drop database lesvaguavtsite; CREATE DATABASE lesvaguavtsite CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
docker exec -i db-diff_db_1 mysql -uroot -psomewordpress lesvaguavtold < /mnt/d/WpVagua2021/lesvaguavtold.sql
docker exec -i db-diff_db_1 mysql -uroot -psomewordpress lesvaguavtsite < /mnt/d/WpVagua2021/lesvaguavtsite.sql
