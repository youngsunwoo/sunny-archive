


### [beanname](https://docs.spring.io/spring/docs/5.2.0.RELEASE/spring-framework-reference/core.html#beans-beanname)

빈의 식별자는 유일해야한다. (컨테이너 내)
Bean의 Name이나 ID를 명시적으로 설정하지 않으면 컨테이너는 해당 Bean의 고유한 Name 을 생성한다.

기본적으로 네이밍은 아래 rule ↓↓↓↓
> The convention is to use the standard Java convention for instance field names when naming beans. 
> That is, bean names start with a lowercase letter and are camel-cased from there.
빈 네이밍은 자바 표준에 따라 인스터스 필드이름으로 생성.
빈 네임은 **소문자로 시작** ~~(잊지말자 삽질의 순간들)~~ , 카멜케이스로 생성된다. 

기본적으로 클래스 명으로, 첫글자는 소문자로. 
그러나 첫 번째,두번째 글자가 모두 대문자 인 경우 원래 대소문자 유지 (?)
alias 사용 가능
  
  
  
### `@Bean` Annotation

default, the bean name is the same as the method name
