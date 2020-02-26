
### • mySql image 받기 
> docker pull mysql

### • 컨테이너로 실행하기 

> docker run --name sunny_sql -e MYSQL_ROOT_PASSWORD=sunny -d -p 3306:3306 mysql -v /Users/woo-ys/systemmv/mysql/data:/var/lib/mysql mysql:8

### • 컨테이너 실행 확인하기  
> sunny-archive git:(master) ✗ docker images
```command
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              16.04               657d80a6401d        5 months ago        121MB
```
### • 컨테이너 접속하기
> sunny-archive git:(master) ✗ docker exec -it sunny_sql /bin/bash
```command
root@3ba3134c0860:/# 
```

### • mysql 접속 확인하기

> root@3ba3134c0860:/# mysql -u root -p
```command
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.19 MySQL Community Server - GPL

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

> mysql> select @@version
```command
    -> ;
+-----------+
| @@version |
+-----------+
| 8.0.19    |
+-----------+
1 row in set (0.00 sec)
```

> create datebase sunnyDB



```sql
CREATE TABLE MGM_BLDRGST_TB (
	MGM_BLDRGST_PK varchar(33) NULL COMMENT '관리_건출물대장_PK',
	MGM_UPPER_BLDRGST_PK varchar(33) NULL COMMENT '관리_상위_건축물대장_PK',
	REGSTR_GB_CD varchar(1) NULL COMMENT '대장_구분_코드',
	REGSTR_GB_CD_NM varchar(100) NULL COMMENT '대장_구분_코드_명',
	REGSTR_KIND_CD varchar(1) NULL COMMENT '대장_종류_코드',
	REGSTR_KIND_CD_NM varchar(100) NULL COMMENT '대장_종류_코드_명',
	PLAT_PLC varchar(500) NULL COMMENT '대지_위치',
	NEW_PLAT_PLC varchar(400) NULL COMMENT '도로명_대지_위치',
	BLD_NM varchar(100) NULL COMMENT '건물_명',
	SIGUNGU_CD varchar(5) NULL COMMENT '시군구_코드',
	BJDONG_CD varchar(5) NULL COMMENT '법정동_코드',
	PLAT_GB_CD CHAR(1) NULL COMMENT '대지_구분_코드',
	BUN VARCHAR(4) NULL COMMENT '번',
	JI VARCHAR(4) NULL COMMENT '지',
	SPLOT_NM varchar(200) NULL COMMENT '특수지_명',
	BLOCK varchar(20) NULL COMMENT '블록',
	LOT varchar(20) NULL COMMENT '로트',
	BYLOT_CNT varchar(5) NULL COMMENT '외필지_수',
	NA_ROAD_CD varchar(12) NULL COMMENT '새주소_도로_코드',
	NA_BJDONG_CD varchar(5) NULL COMMENT '새주소_법정동_코드',
	NA_UGRND_CD varchar(100) NULL COMMENT '새주소_지상지하_코드',
	NA_MAIN_BUN NUMERIC(5) NULL COMMENT '새주소_본_번',
	NA_SUB_BUN NUMERIC(5) NULL COMMENT '새주소_부_번',
	JIYUK_CD varchar(6) NULL COMMENT '지역_코드',
	JIGU_CD varchar(6) NULL COMMENT '지구_코드',
	GUYUK_CD varchar(6) NULL COMMENT '구역_코드',
	JIYUK_CD_NM varchar(100) NULL COMMENT '지역_코드_명',
	JIGU_CD_NM varchar(100) NULL COMMENT '지구_코드_명',
	GUYUK_CD_NM varchar(100) NULL COMMENT '구역_코드_명',
	CRTN_DAY varchar(8) NULL COMMENT '생성_일자'
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci ;
```



https://kamang-it.tistory.com/entry/DockerMysqlInitSql


https://github.com/youngsunWoo/nice_assignment.git