# Chapter3# 고급와이어링

### 1.스프링 프로파일  
데이터베이스 설정, 암호화 알고리즘 및 외부 시스템과의 통합은 전체 환경에 걸쳐 변동될 가능 성이 있다.  
이러한 문제점을 스프링은 재구성을 하지 않고 해결할 수 있다.  

**1.1 빈 프로파일 설정**
spring 3.1에서 도입된 개념으로 @Profile 어노테이션을 이용  
@Profile 애너테이션은 설정 클래스의 빈이 dev 프로파일이 활성화된 경우에만 작성되어야 함을 스프링에 알려 준다.  
dev 프로파일이 활성화되지 않은 경우, @Bean 메소드는 무시된다.  
```java
@Configuration  
@Profile("dev")  
public class DataSourceConfig {
    
    @Bean(destroyMethod="shutdown")
    public DataSource embeddedDataSource(){
        return new EmbeddedDatabaseBuilder()
        .setType(EmbeddedDatabaseType.H2)
        .addScript("classpath:schema.sql")
        .addScript("classpath:test-data.sql")
        .build();
    }
}
```
스프링 3.2 이상에서는 @Bean 애너테이션과 함께 메소드 수준에서 @Profile을 사용  
하나의 설정 클래스에서 두개의 빈 선언이 가능하다. 
```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Profile("dev")
    public DataSource embededDataSource(){
        return new EmbeddedDatabaseBuilder()
                    .setType(EmbeddedDatabaseType.H2)
                    .addScript("classpath:schema.sql")
                    .addScript("classpath:test-data.sql")
                    .build();
    }
    
    @Bean
    @Profile("prod")
    public DataSource jndiDataSource(){
        JndiObjectFactoryBean jndiObjectFactoryBean = new JndiObjectFactoryBean();
        jndiObjectFactoryBean.setJndiName("jdbc/myDS");
        jndiObjectFactoryBean.setResourceRef(true);
        jndiObjectFactoryBean.setProxyInterface(javax.sql.DataSource.class);
        
        return (DataSource)jndiObjectFactoryBean;
    }
}
```
프로파일 활성화 여부와 상관없이, 프로파일이 지정되지 않은 모든 빈은 항상 활성화 된다.  

**1.2 빈 프로파일 활성화하기**
스프링은 프로파일이 활성 상태인지를 결정하는 두 가지 프로퍼티를 가진다.  
spring.profiles.active  
spring.profiles.default  

spring.profiles.active가 설정되어 있는 경우, 그 값은 프로파일이 활성 상태인지를 결정한다.  
spring.profiles.active가 설정되어 있지 않으면 스프링은 spring.profiles.default가 된다.   
spring.profiles.active 또는 spring.profiles.default가 설정되어 있지 않은 경우, 활성화 프로파일은 없으며 프로파일에 정의되지 않은 빈만 만들어진다.  
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
        http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
         id="WebApp_ID" version="2.5">
 
    <display-name>study</display-name>
    
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:spring/application-config.xml</param-value>
    </context-param>
    
    <!— 컨텍스트를 위한 기본 프로파일 설정  —>
    <context-param>
        <param-name>spring.profiles.default</param-name>
        <param-value>dev</param-value>
    </context-param>
 
    <listener>
        <listener-class>
            org.springframework.web.context.ContextLoaderListener
        </listener-class>
    </listener>
 
    <servlet>
        <servlet-name>dispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/mvc-config.xml</param-value>
        </init-param>
        <!— 서블릿을 위한 기본 프로파일 설정 —>
        <init-param>
            <param-name>spring.profiles.default</param-name>
            <param-value>dev</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
 
    <servlet-mapping>
        <servlet-name>dispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```
  
  
### 2. 조건부 빈
스프링 4.0 에서는 @Bean 을 적용할 수 있는 새로운 @Conditional 애너테이션 존재  
조건이 참인 경우 빈이 생성, 그렇지 않으면 빈은 무시  
```java
@Bean
@Conditional(MagicExistsCondition.class)
public MagicBean magicBean(){
    return new MagicBean();
}

@Conditional은 Condition 인터페이스와 같이 사용된다. 
public interface Condition {
    boolean matches(ConditionContext ctxt,
                    AnnotationTypeMetadata metadata);
}
```

### 3. Autowired 의 애매성
동일한 인터페이의 구현체가 여러개 있는 경우 Autowired하면 오류발생  
> NouniqueBeanDefinitionException  
  
Sample Code  
```java
@Autowired
public void setDessert(Dessert dessert) {
    this.dessert = dessert
}


@Component
public class Cake implements Dessert {…}


@Component
public class Cookies implements Dessert {…}


@Component
public class IceCream implements Dessert {…}
```

**3.1 @Primary**
@Primary제한자를 통해 “선호하는” 빈을 선언 가능하며 해당 빈을 우선으로 찾는다  
>> 그런데 아래 sample처럼 @Primary 가 여러번 선언된다면..? 결국 같은 문제가 발생하게 된다.   

Sample Code
```java
@Component
@Primary
public class Cake implements Dessert {…}


@Bean
@Primary
public class Cookies implements Dessert {…}
```
  
**3.2 @Qualifier**
Sample Code
```java
@Autowired
@Qualifier(“iceCream”)
public void setDessert(Dessert dessert) {
    this.dessert = dessert
}
``` 
Qualifier의 파라미터는 는 주입할 빈의 id값이다.   
기본적으로 @Compomnent 어노테이션으로 생성된 빈은 소문자로 시작하는 클래스명으로 생성된다. (문자열 iceCream을 기본수식자로 가지는 빈을 참조한다)   
  
>> 클래스 이름이 변경되거나 리팩토링 하는 경우 빈의 id와 기본 수식자가 변경되고 결국 빈을 찾을수 없는 문제가 발생한다  
빈 선언시 @Qualifier를 통해 수식자를 지정해 사용한다.   
* 이름보단 묘사를 사용하는게 좋다.  haagendaz 보단.. cold 같은..  
```java
@Component
@Qualifier(“cold”)
public class IceCream implements Dessert {…}

@Autowired
@Qualifier(“cold”)
public void setDessert(Dessert dessert) {
    this.dessert = dessert
}
```
>> 같은 Qualifier값을 가지는 빈이 있는 경우엔?  
빈 선언시 @Qualifier를 통해 수식자를 여러개 지정해 사용  
```java
@Component
@Qualifier(“cold”)
@Qualifier(“creamy”)
public class IceCream implements Dessert {…}

@Component
@Qualifier(“cold”)
@Qualifier(“fruity”)
public class Juice implements Dessert {…}

@Autowired
@Qualifier(“cold”)
@Qualifier(“creamy”)
public void setDessert(Dessert dessert) {
    this.dessert = dessert
}
```
>> 같은 어노테이션을 중복해서 사용할수 없다.  *자바 8에서는 @Repeatable 사용기 가능하나 @Qualifier는 예외  
직접 어노테이션을 생성해서 정의한다  
```java
@Target({ElementType.CONSRUCTOR, ElementType.FIELD,
         ElementType.METHOD, ElementType.TYPE})
@Retention(RetemtionPolicy.RUNTIME)
@Qualifier
public @interface Cold{ }

@Target({ElementType.CONSRUCTOR, ElementType.FIELD,
         ElementType.METHOD, ElementType.TYPE})
@Retention(RetemtionPolicy.RUNTIME)
@Qualifier
public @interface Creamy{ }

@Component
@Cold
@Creamy
public class Juice implements Dessert {…}
```
  
```
* 참고사항  
@Autowired: 스프링이 타입(class)을 우선으로 bean 객체를 검색  
- BinarySearchImpl은 SortAlgorithm 을 depends on 한다.  
- SortAlgorithm은 BinarySearchImpl의 dependency다.  
- autowiring 의 bean 선택은 3가지 (우선순위순)  
- @Qualifier  
- @Primary  
- 변수명을 dependency 빈 이름으로 (ex private SortAlgorithm bubbleSortAlgorithm)  


@Resource: 스프링이 이름(id)을 우선으로 bean 객체를 검색  
- resourcing 의 bean 선택
- 지정한 name과 id가 같은 bean 객체
- 타입이 같은 bean 객체
- 만약 타입이 같은 bean 객체가 2개 이상이면, 변수명과 id가 같은 bean 객체
- @Qualifier가 지정한 bean 객체
```

### 4. BeanScope
```
스프링에서 생성되는 빈은 기본적으로 ‘싱글톤’으로 생성됨    
singleton : 기본 싱글톤 스코프  
prototype : 어플리케이션에서 요청시 (getBean()) 마다 스프링이 새 인스턴스를 생성  
session : HTTP 세션별로 인스턴스화되며 세션이 끝나며 소멸 (spring mvc webapplication 용도)  
request : HTTP 요청별로 인스턴스화 되며 요청이 끝나면 소멸 (spring mvc webapplication 용도)  
global session : 포틀릿 기반의 웹 어플리케이션 용도. 전역 세션 스코프의 빈은 같은 스프링 MVC를 사용한 포탈 어플리케이션 내의 모든 포틀릿 사이에서 공유할 수 있다  
thred : 새 스레드에서 요청하면 새로운 bean 인스턴스를 생성, 같은 스레드에 대해서는 항상 같은 bean 인스턴스가 반환  
custom : org.pringframework.beans.factory.config.Scope를 구현하고 커스텀 스코프를 스프링의 설정에 등록하여 사용  
```

Sample Code - 프로토타입으로 선언하기 
```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class Notepad{...}
```
* @Scope(“prototype”) 가능 하나 ConfigurableBeanFactory클래스의 SCOPE_PROTOTYPE 상수값 사용  

**4.1 request, session 범위 작업**
- 웹 애플리케이션에서 특정 요청을 하거나, 세션 범위 내에서 공유하는 Bean을 인스턴스화할때 사용.  
  예를 들어 장바구니를 나타내는 빈이 싱글톤일 경우에는 모든 사용자가 동일한 장바구니에 제품을 추가한다.  
```java
@Component
@Scope(
    value=WebApplicationContext.SCOPE_SESSION, // 세션스코프 설정
    proxyMode=ScopedProxyMode.INTERFACES)      // INTERFACES 프록시 모드 설정, 인터페이스를 구현하고 구현 빈에 위임할 필요가 있다는 의미로 설정
public ShoppingCart cart() { ... }
```

### 5. 런타임 값 주입
빈 와이어링 할때 프러퍼티나 인수를 하드코딩 형태로 참조하지않고 런타임에 결정되도록 하는 방법  
Sample Source : 하드코딩방식  
```java
   @Component
     public class GoodDayByIU implements CompactDisc {


       private String title = "GoodDay"
       private String artist = “IU”


       public void play() {
           System.out.println(“Playing “ + title + “ by “ + artist;            
       }
     }
```
1) 프로퍼티 플레이스홀더(Property palceholders)  
2) 스프링 표현 언어(SpEL, Spring Expression Language)  

**5.1 외부 값 주입**
 가장 간단한 방법으로 프로퍼티소스를 선언하고 스프링환경에서 검색해서 사용한다.
```java
@Configuration 
@PropertySource("classpath:/com/soundsystem/app.properties”) 
public class ExpressiveConfig { 


    @Autowired 
    Environment env; 
    @Bean 
    public BlankDisk disk() { 
        return new BlankDisc(
                env.getProperty("disc.title"),
                 env.getProperty("disc.artist")
        );
    } 
}
```
app.properties  
disc.title=GoodDay  
disc.arties=IU  

getProperty() 함수 Overload()  
- String getProperty(String Key)  
- String getProperty(String Key, String defaultValu e)  
- T getProperty(String Key, Class<T> type)  
- String getProperty(String Key, Class<T> type, T defaultValue)  
* 프러퍼티가 정의되지 않은 경우 IIegalStateExcrption이 발생한다 containProperty() 함수를 사용해서 check가능   

(1) 프로퍼티 플레이스홀더(Property palceholders)
스프링 와이어링에서 플레이스홀더 값은 ${ ... }로 쌓여진 프로퍼티 명이다.

xml형식 
```xml
<bean id="sgtPapers" class="soundsystem.BalnkDisc" c:_title="${disk.title}" c:_artist="${disc.artist}" />
```

@AutoWired 애너테이션을 사용할 때와 동일한 방법으로 @Value 애너테이션을 사용한다.  
```java
public BlankDisc(
       @Value("${disc.title}") String title, 
       @Value("${disc.artist}") String artist) {
      this.title = title;
      this.artist = artist;
}
```

플레이스홀더 값을 사용하기 위해 PropertyPlaceholderConfiguraer 빈 또는 PropertySourcePlaceholderConfigurer 빈을 설정한다.  
```java
@Bean
public static PropertysourcesPlaceholderconfigurer placeholderConfigurer() {
    return new PropertySourcesPlaceHolderConfigurer();
}
```

(2) 스프링 표현 언어(SpEL, Spring Expression Language)




