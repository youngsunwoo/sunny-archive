# Chapter16 스프링 프레임워크 


## 스프링 핵심기능과 어플리케이션 컨택스트
  
#### ` Q1. 스프링에서 의존성 주입을 어떻게 하는가?`
- 의존성 주입은 스프링의 핵심기능중 하나로 다른 클래스나 서브파티 인터페이스가 있는 클래스의 의존성을 제거 할 수 있게 해준다. 
- 의존성 주입의 장점은 의존성의 구현을 클래스 내부 소스 변경없이 바꿀수 있다는 것이다.    

(sampleCode) 철자를 체크하는 어플리게이션 예제 
```java
public class SpellCheckApplication {
 	private final Dictionary dictionary;
 	public SpellCheckApplication(final Dictionary dictionary) {
 		this.dictionary = dictionary;
 	}

 	public List<Integer> checkDocument(List<String> document) {
 		final List<Integer> misspelledWords = new ArrayList<>();
 		for (int i = 0; i < document.size(); i++) {
 			final String word = document.get(i);
 			if (!dictionary.validWord(word)) {
 				misspelledWords.add(i);
 			}
 		}
 		return misspelledWords;
 	}
}
``` 
- SpellCheckApplication Dictionary에 의존적이다.  
철차를 체크하기 위해 validWord 함수를 호출하며 실제로 어떻게 처리되는지 할 수 없다  .
SpellCheckApplication이 실제로 실행될때 설정해야한다. 

- 테스트를 위해 Dictionary 인터페이스를 구현할 필요는 없으면 mock을 사용해 생성할 수 있다.

(sampleCode) 철자를 체커를 실행하는 클래스
```java
public class SpellCheckRunner {
	public static void main(String[] args) throws IOException {
		if(args.length < 1) {
			System.err.println("Usage java SpellCheckRunner <file_to_check>");
			System.exit(-1);
		}
		final Dictionary dictionary = new FileDictionary("/usr/share/dict/words");
 		final SpellCheckApplication checker = new SpellCheckApplication(dictionary);
 		final List<String> wordsFromFile = getWordsFromFile(args[0]);
 		final List<Integer> indices = checker.checkDocument(wordsFromFile);
 		if (indices.isEmpty()) {
			System.out.println("No spelling errors!");
		} else {
			System.out.println("The following words were spelled incorrectly:");
			for (final Integer index : indices) {
				System.out.println(wordsFromFile.get(index));
			}
		}
	}

 	static List<String> getWordsFromFile(final String filename) {
 		/* omitted */
 	}	
}
``` 
- FileDictionary 클래스 명시는 문제되지 않으며 이 클래스를 통해 생성자가 파일 경로 String을 인자로 받는다. 
- 위 구현은 파일 위치가 변경되거나 서드파티의 사전을 사용하는 경우 변경이 필요하다. 
- 따라서 직접 객체를 생성해 주입하기 보다는 프레임워크를 사용하여 의존성을 주입받아 이를 해결해보자

(sampleCode) XML을 이용한 스프링 어플리케이션 컨택스트 정의
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
 	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 	xsi:schemaLocation=" http://www.springframework.org/schema/beans
 	http://www.springframework.org/schema/beans/spring-beans.xsd">
 	
	<bean id="dictionary" class="com.wiley.javainterviewsexposed.chapter16.FileDictionary">
		<constructor-arg value="/usr/share/dict/words"/>
 	</bean>
 	<bean id="spellChecker" class="com.wiley.javainterviewsexposed.chapter16.SpellCheckApplication">
 		<constructor-arg ref="dictionary"/>
 	</bean>
</beans>
```
- 위 xml파일은 dictionary와 spellChecker 두개의 빈을 정의하며 생성자용 값도 제공한다.
- constructor-arg 태그로 string 값을 받아 생성자에 값을 넣어줄수 있다. 
- property 태그를 사용해 setter속성 정의도 가능하다. 
- <property name="location" value="London"/>는 setLocation("London")과 같은 역할을 한다. 메소드가 없으면 오류가 나며 실행전까지 알 수가 없다. 
- spellChecker빈은 constructor-arg 의 ref 속성을 이용하여 dictionary 빈을 생성자로 받는다. 


#### ` Q2.  자바 코드에서 어플리케이션 컨택스트를 어떻게 정의 하는가?`  
- 스프링 3.0 에서 도입된 어플리케이션 컨택스트를 통해 설정에서 클래스 패스를 찾을수 있다.  
- @Configuration 어노테이션이 있는 클래스 내부의 @Bean 어노테이션이 붙은 메소드을 Bean으로 만들어준다. 
```java
@Configuration
public class SpringJavaConfiguration {
 	@Bean
 	public Dictionary dictionary() throws IOException {
 		return new FileDictionary("/usr/sunny/documents/words");
 	}
 	@Bean
 	public SpellCheckApplication spellCheckApplication() throws IOException {
 		return new SpellCheckApplication(dictionary());
 	}
}
```

- @Configuration 어노테이션이 있는 클래스의 리스트를 받도록 AnnotationConfigApplicationContext 클래스로 어플리케이션을 초기화한다.
```java
final ApplicationContext context =
 new AnnotationConfigApplicationContext(SpringJavaConfiguration.class);
```

```xml
<context:component-scan base-package="com.sunny.javainterviewsexposed.chapter16"/>
```

#### ` Q3.  스코프란 무엇인가`  
- 기본적으로 스프링의 빈의 인스턴드는 1개만 생성된다 -> 즉 싱글턴스코프이다.
- 스코프 종류
```
- singleton : 기본 싱글톤 스코프
- prototype : 어플리케이션에서 요청시 (getBean()) 마다 스프링이 새 인스턴스를 생성
- session : HTTP 세션별로 인스턴스화되며 세션이 끝나며 소멸 (spring mvc webapplication 용도)
- request : HTTP 요청별로 인스턴스화 되며 요청이 끝나면 소멸 (spring mvc webapplication 용도)
- global session : 포틀릿 기반의 웹 어플리케이션 용도. 전역 세션 스코프의 빈은 같은 스프링 MVC를 사용한 포탈 어플리케이션 내의 모든 포틀릿 사이에서 공유할 수 있다
- thred : 새 스레드에서 요청하면 새로운 bean 인스턴스를 생성, 같은 스레드에 대해서는 항상 같은 bean 인스턴스가 반환
- custom : org.pringframework.beans.factory.config.Scope를 구현하고 커스텀 스코프를 스프링의 설정에 등록하여 사용
```

#### ` Q4.  환경별 속성을 관리 하려면 어떻게 설정해야 하는가?`  
- PropertyPlaceholderCongigurer 클래스는 빌드할때 외부에 속성을 설정할수 있도록 한다.  
- 테스트를 위해 각 환경별로 파일을 만들기보다는 환경별 설정을 통해 제어도록 하자.  
```xml
<bean class="org.springframework.beans.factory.configPropertyPlaceholderConfigurer">
 	<property name="location" value="/com/sunny/javainterviewsexposed/chapter16/environment.properties"/>
 	<property name="placeholderPrefix" value="$property{"/>
 	<property name="placeholderSuffix" value="}"/>
</bean>
<bean class="com.wiley.javainterviewsexposed.chapter16.ServerSetup">
 	<constructor-arg value="$property{server.hostname}"/>
</bean>
```
- PropertyPlaceholderCongigurer의 location속성을 통해 파일을 설정하고 클래스에는 해당 파일에서 속성값들을 분석한다. 
- 어플리케이션을 실행할때 파싱되어 다른 빈의 매개변수로 사용 될 수 있다. 


#### ` Q5.  오토와이어링이란 무엇인가?`  
(1) XML이용
- xml을 통한 오토와이어링 설정
```xml
 <bean id="dictionary" class="com.sunny.javainterviewsexposed.chapter16.FileDictionary">
 	<constructor-arg value="/usr/share/dict/words"/>
 </bean>
 <bean id="spellChecker"
 	class="com.sunny.javainterviewsexposed.chapter16.SpellCheckApplication"
 	autowire="constructor"/>
 ```

- 오토와이어링 테스트
```java
@Test
public void getAutowiredBean() {
 	final ApplicationContext context = new ClassPathXmlApplicationContext(
 				"com/sunny/javainterviewsexposed/" +
 				"chapter16/applicationContextAutowiring.xml");
 	
	 final SpellCheckApplication bean = context.getBean(SpellCheckApplication.class);
	assertNotNull(bean);
}
```
- 위 xml설정은 어플리케이션 컨택스트에 SpellCheckApplication의 생성자로 쓰일 데이터 타입인 Dictionary 타입 클래스를 찾도록 한다. 
- 컨택스트에 Dictionary 타입의 구현체가 없으면 NoSuchBeanDefinitionException이 발생한다. 


(2) Autowired 어노테이션 이용 
- @Autowired 통한 생성자에 오토와이어링 설정
```java
@Autowired
public SpellCheckApplication (final Dictionary dictionary) {
 	this.dictionary = dictionary;
}
```

- 컨택스트가 같은 타입의 빈을 여러개 가지고 있다면 @Qualifier를 통해 빈을 구체화 할 수 있다. 

**(참고) Autowired과 @Resource 차이**  
 #### @Autowired : 스프링이 타입(class)을 우선으로 bean 객체를 검색

  > * BinarySearchImpl은 SortAlgorithm 을 depends on 한다.
  > * SortAlgorithm은 BinarySearchImpl의 dependency다.
  > * autowiring 의 bean 선택은 3가지 (우선순위순)
  > * @Qualifier
  > * @Primary
  > * 변수명을 dependency 빈 이름으로 (ex private SortAlgorithm bubbleSortAlgorithm)
   
   
#### @Resource : 스프링이 이름(id)을 우선으로 bean 객체를 검색

  > * resourcing 의 bean 선택
  > * 지정한 name과 id가 같은 bean 객체
  > * 타입이 같은 bean 객체
  > * 만약 타입이 같은 bean 객체가 2개 이상이면, 변수명과 id가 같은 bean 객체
  > *  @Qualifier가 지정한 bean 객체
  

-----
## 스프링 JDBC 
  
#### ` Q1.  스프링은 어떻게 JDBC 코드의 가독성을 개선하는가?`  

- 기본 JDK API를 이용한 DB Connection
- 데이터베이스에 접근하기 위해 Connection, Prepared Statement, ResultSet같은 클래스들의 생성,사용,파기를 관리해아 한다.  
- 특히 파기 과정에서 SQLException이 발생하는 경우 DB커넥션이 계속 살아있는 경우가 발생한다.  
- 또한, try에서 초기화되고 finally 블록에서 닫히므로 final로 선언 될 수 없어 재할당에 대한 위험도 존재한다. 
```java
@Test
public void plainJdbcExample() {
	Connection conn = null;
 	PreparedStatement insert = null;
 	PreparedStatement query = null;
 	ResultSet resultSet = null;
 	try {
 		Class.forName("com.mysql.jdbc.Driver");
 		conn = DriverManager.getConnection(
 				"jdbc:mysql://localhost:3306/springtrans?" +
 				"user=nm&" +
 				"password=password");
 		insert = conn.prepareStatement("insert into user values (?, ?)");
 		final List<String> users = Arrays.asList("Dave", "Erica", "Frankie");
 		for (String user : users) {
 			insert.setString(1, UUID.randomUUID().toString());
			insert.setString(2, user);
 			insert.executeUpdate();
 		}
 		query = conn.prepareStatement("select count(*) from user");
 		resultSet = query.executeQuery();

		if (!resultSet.next()) {
			fail("Unable to retrieve row count of user table");
		}
			final int rowCount = resultSet.getInt(1);
			assertTrue(rowCount >= users.size());
		} catch (ClassNotFoundException | SQLException e) {
			fail("Exception occurred in database access: " + e.getMessage());
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
			fail("Unable to close Database connection: " + e.getMessage());
		}
	}
}
```
- 스프링에서는 Jdbcutils클래스를 통해 다양한 기능을 제공한다.]
- -> close할때의 예외상황을 보다 간결하게 관리할 수 있다. 
- -> ResultSet에서 결과를 가져도록 지원한다.  
- -> snake_case를 camelCase로 변환하는 함수도 지원한다. 
```java
	try {
		// 위와 동일
	} catch (ClassNotFoundException | SQLException e) {
		// 위와 동일 
	} finally {
		JdbcUtils.closeResultSet(resultSet);
		JdbcUtils.closeStatement(query);
		JdbcUtils.closeStatement(insert);
		JdbcUtils.closeConnection(conn);
	}
```

(tip) 자바 8에서 도입된 try-with-resource문을 사용시 코드를 더 간결하게 사용가능하다. 

#### ` Q2.  스프링은 기본 JDBC코드 대부분을 어떻게 제거할 수 있는가?`  
- JdcbTemplate클래스를 사용한다. 

- xml로 어플리케이션 컨택스트에 DB설정하기
```xml
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
	<property name="driverClassName" value="com.mysql.jdbc.Driver" />
	<property name="url" value="jdbc:mysql://localhost:3306/springtest" />
	<property name="username" value="sunny" />
	<property name="password" value="password" />
</bean>
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
 	<constructor-arg ref="dataSource"/>
</bean>
```
- JDCB Tamplate 이용하기 
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:com/sunny/javainterviewsexposed /chapter16/jdbcTemplateContext.xml")
public class JdbcTemplateUsage {
	@Autowired
	private JdbcTemplate jdbcTemplate;
	
	@Test
	public void retrieveData() {
		final int rowCount = jdbcTemplate.queryForInt("select count(*) from user");

		final List<User> userList = 
			jdbcTemplate.query(
				"select id, username from user",
				new RowMapper<User>() {
					@Override
					public User mapRow(ResultSet rs, int rowNum) throws SQLException {
						return new User(rs.getString("id"), rs.getString("username"));
					}
				}
			);
		//람다로 처리하기 
		//jdbcTemplate.query(queryString, (rs, rowNum) -> {
 		//	return new User(rs.getString(“id”), rs.getString(“username”));
		//});

		assertEquals(rowCount, userList.size());
	}
}
```
- 위 코드는 데이터베이스에 2번 접근한다. 
- (1) queryForInt메서드느 하나의 행과 열을 반환하기 위해 쿼리를 수행하고 int형을 변환될수 잇는 숫자타입을 반환한다.   
  RequltSet객체에 대한 고민이 필요없다 .
- (2) jdbcTemplate.query 함수는 DB의 각 행이 User객체로 변환된다.   
  각 행이 어떻게 변환되는지는 모르며 rowMapper인터페이스를 익명구현하여 DB각 행마다 mapRow메서드가 호출된다. 
- 결과적으로 데이터베이스 연결이나 데이터베이스 자원 객체를 직적 관리할 필요없으며, 쿼리 실행 후 자원을 해제할 필요도 없다. 

-----
## 통합테스트하기

#### ` Q1.  어플리케이션 컨택스트가 올바르게 설정됐는지 어떻게 테스트 할 수 있는가?`  
- @ContextConfiguration어노테이션을 사용하여 로드될 어플리케이션 컨택스트를 설정할 수 있다.

- @Autuwired된 빈들은 테스트 실행시마다 어플리케이션 컨택스트에서 새로 로드된다.
- 즉, @Before를 통해 테스트 실행정 어노테이션되는 것과 동일하다.
- 테스트가 어플리케이션 컨택스트 상태를 변경해야 하는 경우 해당 클래스에 @FirtiesContext어노테이션을 추가하면,  
테스트마다 전체 어플리케이션 컨택스트를 다시 로드한다. 
```java
@ContextConfiguration(
 "classpath:com/sunny/javainterviewsexposed/chapter16/applicationContext.xml")
@RunWith(SpringJUnit4ClassRunner.class)
public class SpringIntegrationTest {
	@Autowired
	private SpellCheckApplication application;
	@Test
	public void checkWiring() {
		assertNotNull(application);
	}
	@Test
	public void useSpringIntegrationTests() {
	final List<String> words = 
		Arrays.asList("correct",
					"valid",
					"dfgluharg",
					"acceptable");
		final List<Integer> expectedInvalidIndices = Arrays.asList(2);
		final List<Integer> actualInvalidIndices =
		application.checkDocument(words);
		assertEquals(expectedInvalidIndices, actualInvalidIndices);
	}
}
```
#### ` Q2.  통합테스트를 실행할 때 데이터베이스를 깨끗하게 유지하는 방법은 무엇인가`  

- @Before가 실행되기 전에 트랜젝션이 열린다. 테스트가 실행되고 @After까지 실행되면 데이터가 롤백된다.
- @Test 메서드 안에서 (명시적으로) commit이 되지 않는지 확인한다.  
```java
@ContextConfiguration( "classpath:com/sunny/javainterviewsexposed/" +
						 "chapter16/databaseTestApplicationContext.xml")
 public class SpringDatabaseTransactionTest extends AbstractTransactionalJUnit4SpringContextTests {
	private int rowCount;
	@Before
	public void checkRowsInTable() {
		this.rowCount = countRowsInTable("user");
	}
	@Before
	public void checkUsersForTestDoNotExist() {
		final int count = this.simpleJdbcTemplate.queryForInt(
		"select count(*) from user where username in (?, ?, ?)",
		"Alice",
		"Bob",
		"Charlie");
		assertEquals(0, count);
	}
	@Test
	public void runInTransaction() {
		final List<Object[]> users = Arrays.asList(
		new Object[]{UUID.randomUUID().toString(), "Alice"},
		new Object[]{UUID.randomUUID().toString(), "Bob"},
		new Object[]{UUID.randomUUID().toString(), "Charlie"}
	);

	this.simpleJdbcTemplate.batchUpdate("insert into user values (?, ?)", users);
	
	assertEquals(rowCount + users.size(), countRowsInTable("user"));
	}
}
```
- JUnut 4.11에서는 @Test메서드의 실행순서를 정해줄 수 있는 @FixMethodOrder 어노테이션을 제공한다.
- 위 코드처럼 트랜젝션이 롤백되고 테이블이 비었는지 확인하는 코드를 작성하고 runInTransaction 다음에 실행되도록 할 수 있다. 
- 테스트 순서를 명시하는건 좋지않다. 왜냐면 각 테스트는 독릭접으로 수행되어야하니까.. 


- AbstractTransactionalJUnit4SpringContextTests를 확장하고 DataSource와 함께 어플리케이션 컨택스트를 제공
- 테스트 set는 SimpleJdbcTemplate 객체에 접근하고 DB연산을 수행한다.  

-----
## 스프링MVC 
[(참고) Spring in Action > Chapter5# Spring MVC 시작하기](../spring&web/springInAction/Chapter5#SpringMVC시작하기.md)

#### ` Q1.  스프링은 어떻게 웹 어플리케이션을 제공하는가?`  
- 어플리케이션 서버를 실행하면 스프링 MVC는 클래스패스/META-INF 패키지에서 web.xml 파일을 찾는다.
- 이 파일은 서버가 어떤 어플리케이션이나 서블릿을 제공할지 명시한다. 
- 즉, HttpSevlet을 확장하는 클래스를 제공하고 GET/POST에 어떻게 응답할지 정의한다. 

- 스프링 MVC용 서블릿 컨테이너 설정
```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<web-app
	xmlns="http://java.sun.com/xml/ns/javaee"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="
	http://java.sun.com/xml/ns/javaee
	http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
	metadata-complete="false"
	version="3.0">
	<servlet>
		<servlet-name>mvc</servlet-name>
		<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		<load-on-startup>1</load-on-startup>
	</servlet>
	<servlet-mapping>
		<servlet-name>mvc</servlet-name>
		<url-pattern>/mvc/*</url-pattern>
	</servlet-mapping>
</web-app>
```
- /mvc로 시작하는 모든 요청을 DispatcherServlet에 전달한다. 
- DispatcherServlet에 요청이 전달되면 WEB-INF/[servlet-name]-servlet.xml 에서 XML 정의를 찾는다. 
- 해당 xml에서 빈을 설정할수 있으며 서버가 실행될때 빈들이 초기화 된다. 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:p="http://www.springframework.org/schema/p"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="
	http://www.springframework.org/schema/beans
	http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/context
	http://www.springframework.org/schema/context/spring-context.xsd">
	<context:component-scan base-package="com.sunny.javainterviewsexposed.chapter16.mvc"/>

	<bean id="freemarkerConfig" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
		<property name="templateLoaderPath" value="/WEB-INF/freemarker/"/>
	</bean>

	<bean id="viewResolver" class="org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
		<property name="prefix" value=""/>
		<property name="suffix" value=".ftl"/>
	</bean>
	<bean class="com.wiley.javainterviewsexposed.chapter16.mvc.DummySportsResultsService"/>
</beans>
```
- context:component-scan을 통해 @Controller 어노테이션된 클래스를 찾을 패키지를 알려준다. 

> 근데.. xml하지말고.. 스프링 3.0쓰고 자바로 설정하자..    
> AbstractAnnotationConfigDispatcherServletInitializer 상속받자.. 
> [(참고) Spring in Action > Chapter5# Spring MVC 시작하기](../spring&web/springInAction/Chapter5#SpringMVC시작하기.md)   <-이거 보자.. 

#### ` Q2.  어떻게 스프링 MVC에서 쉽게 테스트 할 수 있는 웹 컨트롤러를 만들 수 있는가?`  

  
#### ` Q3.  서버 측 로직을 요쳥 결과 표시와 어떻게 분리해서 유지하는가?`  
- 뷰는 컨트롤러를 통해 전달받은 모델을 보여준다. 
- 뷰는 단순해야하고 컨트롤러는 모델을 전달하기 위한 작업을 수행해야 한다. 

- 뷰에서 플레이스 홀더를 이용하여 동적데이터를 표현할 수 있다. (?)
```java
@RequestMapping("/planets")
public String createSimpleModel(final Model model) {
	model.addAttribute("now", new Date());
	final Map<String, String> diameters = new HashMap<>();
	diameters.put("Mercury", "3000 miles");
	diameters.put("Venus", "7500 miles");
	diameters.put("Earth", "8000 miles");
	model.addAttribute("diameters", diameters);
	return "diameters";
}
```

```html
<html>
<head>
 	<title>Planet Diameters</title>
</head>
<body>
	<#list diameters?keys as planet>
	<b>${planet}</b>: ${diameters[planet]}<br/>
	</#list>
	This page was generated on <i>${now?datetime}</i>
</body>
</html>

```
#### ` Q4.  스프링은 다른 뷰 템플릿 엔진들과 함께 동작하도록 어떻게 설정할 수 있는가?`
템플릿파일로 매핑은 어플리케이션 설정에서 뷰리졸버의 구현에 의존된다. 
원래의(기본) 뷰 리졸버는 아래와 같다.   
- xml로 설정 
```xml
<bean id="viewResolver"
 class="org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver">
 <property name="prefix" value=""/>
 <property name="suffix" value=".ftl"/>
</bean>
```
- (참고) java기반 뷰 리졸버 설정
```java
@Configuration
@EnableWebMvc
@ComponentScan("spittr.web")
public class WebConfig extends WebMvcConfigurerAdapter {

  @Bean
  public ViewResolver viewResolver() {  //<-뷰리졸버 설정
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    return resolver;
  }
```
- 위 코드를 통해서 지정된 경로에서 prefix, suffix를 가지는 파일을 템플릿으로 찾아온다. 
