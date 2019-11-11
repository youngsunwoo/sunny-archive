# Chapter2#Spring BeanWiring

- XML에서의 명시적 설정
- 자바에서의 명시적 설정
- 자동으로 와이어링 하기

### 1.자동으로 와이어링하기
**1.1 컴포넌트 스캐닝**
 - ApplicationContext에서 생성되는 빈을 자동으로 발견  
  
(1) 빈 만들기  
   @Component 어노테이션을 사용하여 빈으로 만들 클래스를 스프링에 알려준다  
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
   @Component Scanning 을 이용하여 @Component 어노테이션된 빈을 찾을 수 있다.   
```java
@Configuration
     @ComponentScan
     public class CDPlayerConfig {
     }
```
    * XML을 이용한 설정  
    ```xml
    <context:compoent-scan base-package=“soundssystem” />
    ```

(2) 빈 네임 지정하기  
```java    
    @Component(“happyDay”) 
    public class GoodDayByIU implements CompactDisc {
    
    @Named(“happyDay”)
    public class GoodDayByIU implements CompactDisc {
```

(3) 패키지 셋팅하기  
- 기본적으로는 설정된 클래스 패키지를 기본 패키지로 하여 컴포너트 스캐닝을 한다.  
```java
    @Configuration
    @ComponentScan(“soundsystem”)
    public class CDPlayerConfig {}
    
    @Configuration
    @ComponentScan(basePakages={“soundsystem”,”video"})
    public class CDPlayerConfig {}
    
    @Configuration
    @ComponentScan(basePakagesClasses={“CDPlayer.class”,”Video.class"})
    public class CDPlayerConfig {}
```

**1.2 오토와이어링**
 - 스프링에서 자동으로 의존성 충족  
   생성자를 이용한 방법     
```java
    @Component
    public class CDPlayer implements MediaPlayer(){
           private CompactDisc cd;

           @Autowired
           public CDPlayer(CompactDisc cd){
                this.cd = cd 
           }
    }
```    
   셋터를 이용한 방법  
```java
    @Component
    public class CDPlayer implements MediaPlayer(){
           private CompactDisc cd;

           @Autowired
           public void setCompactDisc(CompactDisc cd){
                this.cd = cd 
           }
    }
```    
어떤 방법이든 메소드 파라미터에 빈이 일치되면 와이어링 된다.  
매칭되는 빈이없다면 예외가 발생한다.   
예외를 피하려면 @Autowired(required=false)옵션을 사용 (단, nullPointException 주의)    

### 2.자바에서 명시적으로 설정하기
@Configuration 어노테이션 : 설정클래스로 인식하도록 하여 ApplicationContext에서 생성된 빈이 포함될수있다는 것을 명시
```java
    @Configuration
     @ComponentScan
     public class CDPlayerConfig {
     }
 ```    
  
(1) 빈 선언하기  
- 빈네임은 메소드와 동일한id로 생성됨  
```java
@Bean
public CompactDisc goodayByIU(){
    return new GoodayByIU();
}
```
-  빈네임 직접 설정하기 
```java
@Bean(name=“happyDay”)
public CompactDisc goodayByIU(){
    return new GoodDayByIU();
}
```
  
(2) JavaConfig 주입하기      
```java
@Bean
    public CDPlayer cdPlayer() {
        return new CDPlayer(goodayByIU());
    }


    @Bean
    public CDPlayer newCdPlayer() {
        return new CDPlayer(goodayByIU());
    }
 ```  
- 위에서 빈으로 선언된 goodayByIU를 주입하여 cdPlayer빈을 생성  
- goodayByIU를 호출하는 아니고 이미 생성된 빈으로 리턴해줄뿐  
- newCdPlayer와 cdPlayer의goodayByIU는 같은 객체이다 (* 싱글톤기반으로 관리됨)  
  
  
### 3.XML로 관리하기  
기본 스프링 설정  
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:c="http://www.springframework.org/schema/c"
  xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

</beans>
 ``` 
(1) 빈 선언하기  
- package 명을 포함한 완전한 클래스명으로 표기  
    <bean class="soundsystem.GoodayByIU"/>  

- id 선언하기  
    <bean id="compactDisc" class="soundsystem.GoodayByIU"/>  

(2) 생성자주입을 통해 빈 초기화하기  

2.1) 빈 레퍼런스 주입  
- constructor-arg 사용  
   <bean id=“caPlayer" class="soundsystem.CDPlayer">  
        <constructor-arg ref=“compactDisc" />  
   </bean>  
- c-namespace사용  
   <bean id=“caPlayer" class=“soundsystem.CDPlayer” c:cd-ref=“compactDisc” />  

    c:{인자명}-ref=“compactDisc  
    c:_{인덱스}-ref=“compactDisc  
  
2.2) 일반값(리터럴 값) 주입   
- constructor-arg 사용  
   <bean id=“caPlayer" class="soundsystem.CDPlayer">  
        <constructor-arg value=“goodDay" />   
        <constructor-arg value=“IU" />   
   </bean>  
- c-namespace사용  
   <bean id=“caPlayer" class=“soundsystem.CDPlayer”  
         c:_title=“goodDay”   
         c:_artist=“IU"/>      

    c:_{인자명}=“compactDisc"  
    c:_{인덱스}=“compactDisc"  
