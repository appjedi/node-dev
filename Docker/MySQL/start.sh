docker run --name ms -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:tag
