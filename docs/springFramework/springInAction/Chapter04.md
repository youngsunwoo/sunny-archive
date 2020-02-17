# Chapter3# AOP

### 1. AOP란

**용어정리**
어드바이스 (Advice)  
 Aspect의 기능 그 자체  
 어드바이스는 애스펙트가 '무엇'을 '언제' 할지를 정의

포인트컷 (PointCut)  
  부가기능이 적용될 대상(메소드)를 선정하는 방법  
  즉, 어드바이스를 적용할 조인포인트를 선별하는 기능을 정의한 모듈  

조인포인트 (JoinPoint)  
  어드바이스가 적용될 수 있는 위치  
  다른 AOP 프레임워크와 달리 Spring에서는 메소드 조인포인트만 제공한다.   

애스펙트 (Aspect)   
  어드바이스 (Advice) + 포인트컷 (PointCut)  

인트로덕션(Introduction)  
  기존 클래스의 코드변경 없이 새 메소드나 멤버변수를 추가할수 있는 기능  

위빙(Weaving)    
  타깃에 애스팩드를 적용해서 프록시 객체를 생성하는 절차  

* Spring 의 AOP지원  
- 고정적인 스프링 프록시 기반 AOP  
- Pure-POJO 애스팩트  
- @AspectJ 애너테이션 기반  
- AspectJ 에스팩트에 빈 주입  

### 2. 포인트컷트를 이용한 조인포인트 설정 
포인트커트는 애스펙트의 어드바이스를 적용할 위치를 지정하는 데 사용한다  
AspectJ의 포인트커트 표현식 언어  

**2.1 포인트컷 작성**
package consert;
 
public interface Performance {
    public void perform();
}
Performance는 공연을 나타낸다.
Performamce의 perform() 메소드를 트리거링(triggering)하는 애스펙트를 작성할 수 있다
perform() 메소드가 실행될 때마다 어드바이스를 하기 위해 사용될 수 있는 포인트커트 표현식을 나타낸다.

execution(수식어패턴? 리턴타입패턴 패키지패턴?이름패턴(파라미터패턴)

**2.2 빈 선택하기**
지정자 목록 외에도 스프링은 새로운 bean() 지정자를 도입했는데, 이를 이용하여 포인트커트 표현식 내에서 ID로 빈을 지정할 수 있다.
bean()은 인자로 빈 ID나 이름을 받고 특정 빈에 대한 포인트커트의 영향을 제한한다.
execution(* consert.Performance.perform())
    and bean('woodstock')
여기서 애스펙트 어드바이스를 Performance에 있는 perform() 메소드의 실행에 적용하되 ID가 woodstock인 빈으로 제한한다.

특정 빈으로 포인트커트를 좁히는 경우의 작업도 있지만, 특정 ID가 아닌 모든 빈에 애스펙트를 적용하기 위해 부정(!)을 사용할 수도 있다.
execution(* consert.Performance.perform())
    and !bean('woodstock’)
이 경우에 애스펙트의 어드바이스는 ID가 woodstock이 아닌 모든 빈에 위빙된다.

### 3. 애스팩트 에너테이션 만들기
**3.1 애스팩트 정의하기 **
```java
@Aspect
public class Audience {
    @Before("execution(** concert.Performance.perform(..)")
    public void silenceCellPhones(){
        System.out.println("Silencing cell phones");
    }
    
    @Before("execution(** consert.Performance.perform(..)")
    public void takeSeats(){
        System.out.println("Taking seats");
    }
    
    @AfterReturning("execution(** consert.Performance.perform(..)")
    public void applause(){
        System.out.println("CLAP CLAP CLAP! ! !");
    }
    
    @AfterThrowing("execution(** consert.Performance.perform(..)")
    public void demandRefund(){
        System.out.println("Demanding a refund");
    }
}
```
Audience 클래스에는 @Aspect라는 애너테이션이 붙어 있다.  
이 애너테이션은 Audience가 더 이상 POJO가 아니라 애스펙트임을 나타낸다.  
Audience 클래스는 특정 애스펙트를 정의하기 위해 애터네이션되는 메서드이다.  

Audience클래스는 네 개의 메소드를 가진다.  
공연전에 핸드폰을 끈고(silenceCellPhones), 착성하고(takeSeat), 공연이 끝나면 박수(applause), 공연이 중단되면 환불(demandRefund) 하는 네 개의 메소드를 가진다.  
이러한 메소드들은 호출될 때를 기다리기 위해서 어드바이스 애너테이션을 사용하여 애너테이션된다.  

AspectJ의 어드바이스를 정의하기 위한 다섯 개의 애너테이션  


반복되는 포인트 컷의 정리 - @Pointcut 애너테이션을 사용하면 한 번만 포인트커트를 정의하고 필요할 때마다 참조  
```java
@Aspect
public class Audience {
    @Pointcut("execution(** concert.Performance.perform(..)")
    public void performance(){}
    
    @Before("performance()")
    public void silenceCellPhones(){
        System.out.println("Silencing cell phones");
    }
    
    @Before("performance()")
    public void takeSeats(){
        System.out.println("Taking seats");
    }
    
    @AfterReturning("performance()")
    public void applause(){
        System.out.println("CLAP CLAP CLAP! ! !");
    }
    
    @AfterThrowing("performance()")
    public void demandRefund(){
        System.out.println("Demanding a refund");
    }
}
```

**3.2  around 어드바이스 만들기 **
around 어드바이스는 가장 강력한 어드바이스 타입이다.  
어드바이스된 메소드를 완전히 감싸는 로직을 작성하며, 단일 어드바이스 메소드 내의 before 어드바이스와 after 어드바이스를 작성한다.  
```java
@Aspect
public class Audience {
    @Pointcut("execution(** concert.Performance.perform(..)")
    public void performance(){}
 
    @Around("performance()")
    public void watchPerformance(ProceedingJoinPoint jp){
        try{
            System.out.println("Silencing cell phones");
            System.out.println("Taking seats");
            
            jp.proceed();
            
            System.out.println("CLAP CLAP CLAP! ! !");
        }catch(Throwable e){
            System.out.println("Demanding a refund");
        }
    }
}
```

* 어드바이스에서 파라미터 처리하기
포인트 커트 표현식의 파라미터 선언하기  
트랙 재생횟수를 카운트하기 위해 파라미터화된 어드바이스 사용   
```java
@Aspect
public class TrackCounter {
    private Map<Integer,Integer> trackCounts = 
            new HashMap<Integer, Integer>();
    
    @Pointcut("execution(* soundSystem.CD.playTrack(int))"
            + "&& args(trackNumber)")
    public void trackPlayed(int trackNumber){}
    
    @Before("trackPlayed(trackNumber)")
    public void countTrack(int trackNumber){
        int currentCount = getPlayCount(trackNumber);
        trackCounts.put(trackNumber, currentCount+1);
    }
    
    public int getPlayCount(int trackNumber){
        return trackCounts.containsKey(trackNumber)
                ? trackCounts.get(trackNumber) : 0;
    }
}
```

 
포인트커트 표현식에서 args(trackNumber) 식별자는 playTrack()에 전달되는 int인자는 어드바이스로 전달됨을 나타낸다.  
파라미터 명 trackNumber는 포인트커트 메소드 시그너쳐(signature)의 파라미터와도 매칭된다.  
@Before 애너테이션은 명명된 포인트커트, 즉 trackPlayed(trackNumber)로 정의되어 있는 어드바이스 메소드로 전달된다.  
포인트커트 파라미터는 명명 포인트커트에서 어드바이스 메소드까지의 파라미터의 경로를 제공하는 포인트커트 메소드의 동일 명의 파라미터와 연관된다.  

스프링 설정에서 빈을 등록하고 AspectJ 오토 프록싱(auto-proxing)을 사용한다.   
```java
@Configuration
@EnableAspectJAutoProxy
public class TrackCounterConfig {
    @Bean
    public CD sgtPeppers(){
        BlankCD cd = new BlankCD();
        cd.setTitle("Sgt. Pepper's Lonely Hearts Club Band!");
        cd.setArtist("The Beatles");
        List<String> tracks = new ArrayList<String>();
        tracks.add("Sgt. Pepper's Lonely Hearts Club Band");
        tracks.add("With a Little Help from My Friends");
        tracks.add("Lucy in the Sky with Diamonds");
        tracks.add("Getting Better");
        tracks.add("Fixing a Hole");
        
        cd.setTracks(tracks);
        return cd;
    }
    
    @Bean
    public TrackCounter trackCounter(){
        return new TrackCounter();
    }
}
```
