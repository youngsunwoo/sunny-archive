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
<context:component-scan
 base-package="com.sunny.javainterviewsexposed.chapter16"/>
```

#### ` Q3.  스코프란 무엇인가`  
- 기본적으로 스프링의 빈의 인스턴드는 1개만 생성된다 -> 즉 싱글턴스코프이다.

- **스코프 종류** 
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
 	<property name="location" value="/com/wiley/javainterviewsexposed/chapter16/environment.properties"/>
 	<property name="placeholderPrefix" value="$property{"/>
 	<property name="placeholderSuffix" value="}"/>
</bean>
<bean class="com.wiley.javainterviewsexposed.chapter16.ServerSetup">
 	<constructor-arg value="$property{server.hostname}"/>
</bean>
```


#### ` Q5.  오토와이어링이란 무엇인가?`  
-----
## 스프링 JDBC 

#### ` Q1.  스프링은 어떻게 JDBC 코드의 가독성을 개선하는가?`  
#### ` Q2.  스프링은 기본 JDBC코드 대부분을 어떻게 제거할 수 있는가?`  
-----
## 통합테스트하기

#### ` Q1.  어플리케이션 컨택스트가 올바르게 설정됐는지 어떻게 테스트 할 수 있는가?`  
#### ` Q2.  통합테스트를 실행할 때 데이터베이스를 깨끗하게 유지하는 방법은 무엇인가`  



