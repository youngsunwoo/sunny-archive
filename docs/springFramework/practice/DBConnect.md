
## DataBase 붙이기
Oracle, Jdbc 사용

1. pom.xml 설정
```xml
        <!-- jdbc -->
		<dependency>
			<groupId>ojdbc</groupId>
			<artifactId>ojdbc</artifactId>
			<version>11.2.0.1.0</version>
		</dependency>

        <!-- log4jdbc -->
		<dependency>
			<groupId>org.bgee.log4jdbc-log4j2</groupId>
			<artifactId>log4jdbc-log4j2-jdbc4</artifactId>
			<version>1.16</version>
		</dependency>

		<!-- MyBatis -->
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis</artifactId>
			<version>3.5.1</version>
		</dependency>
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis-spring</artifactId>
			<version>2.0.1</version>
		</dependency>
```

2. application.yml 설정
```yml
melon:
  datasource:
    poc:
     driver-class-name: net.sf.log4jdbc.sql.jdbcapi.DriverSpy
     jdbcUrl: jdbc:log4jdbc:oracle:thin:@{db_connect_url}:1521:{SID}
#      driver-class-name: oracle.jdbc.driver.OracleDriver
#      jdbcUrl: jdbc:oracle:thin:@{db_connect_url}:1521:{SID}
      username: {username}
      password: {password}
```

3. DataSourceConfig.java 작성
```java
@Configuration
@EnableTransactionManagement
public class DataSourceConfig {

    final private static Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean(name = "pocDataSource")
    @ConfigurationProperties("melon.datasource.poc")
    public DataSource pocDataSource()
    {
        logger.info("Setting DS_POC DataSource from properties");
        return DataSourceBuilder.create().build();
    }
}
```

4. 더럽게 테스트 하기
```yml
    @Test
    void DataSourceTest() {
        Connection conn = null;
        PreparedStatement insert = null;
        PreparedStatement query = null;
        ResultSet resultSet = null;
        try{
            conn = pocDataSource.getConnection();

			query = conn.prepareStatement("select count(*) from PPN_CUPN_TB");
			resultSet = query.executeQuery();
			if (!resultSet.next()) {
			}
			final int rowCount = resultSet.getInt(1);

			System.out.println("rowCount = " + rowCount);
		} catch (SQLException e) {
			System.out.println("Exception occurred in database access: " + e.getMessage());
		} finally {
			try {
				if (resultSet != null) {
					resultSet.close();
				}
				if (query != null) {
					query.close();
				}
				if (insert != null) {
					insert.close();
				}
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException e) {
				System.out.println("Exception occurred in database close: " + e.getMessage());

			}
        }
    }
```
--- 
## MyBatis 설정하기