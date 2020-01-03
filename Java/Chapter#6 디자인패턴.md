# Chapter#6 디자인패턴

[Index]
1. Builder Pattern
2. Strategy Pattern
3. Template method Pattern
4. Decorator pattern
5. Flyweight pattern
6. SingleTone pattern


## 1. Builder Pattern
```java
public class Student {

    private final String name;
    private final Integer age;
    private final String grede;
    private final String address;
    private final Date dateOfBirth;    //선택 사항
    .
    .
    .
}
```

- 위와 같이 필드가 많은 객체를 생성 할 경우 생성자를 사용하면 다루기 어렵다.   
- 옵션필드를 포함한 parameter를 갖는 생성자등 생성자를 n개 생성해야하고 관리하기 어렵다.

```java
final Student student = new Student();
s.setAdress("Seoul Guui-dong").
```

- 생성자(setter)를 사용하는 것이 해결책이 될수 있지만, 유효하지 않는 객체가 만들어지기도 한다.  
-  또 필수 값들은 모두 채워져있어야한다. 

- 이러한 경우에 빌더 패턴을 사용하여 객체를 생성하여 해결 할 수 있다.   
  
  
> builder pattern을 이용한 객체 생성 Test sample code
```java
@Test
public void legalBuild(){
    final Student.Builder builder = new Student.Builder();
    final Student student = builder
            .withName("Sunny")
            .withAge(28)
            .withAddress("Seoul")
            .withGrade("A")
            .withDateOfBirth(new Date(1992,01,30))
            .bulid();
}


@Test(expected = IllegalStateException.class)
public void illegalBuild(){
    final Student.Builder builder = new Student.Builder();
    final Student student = builder.withName("Sunny")
            .withAge(28)
            .withAddress("Seoul")
            .withDateOfBirth(new Date(1992,01,30))
            .bulid();
}
```
> Student 클래스 생성을 위한 Builder 클래스 sampleCode
```java
public class Student {

    private final String name;
    private final Integer age;
    private final String grede;
    // 기본값을 정의하는 경우 아래와 같이 설정 
    // private final String grede = Grade.EXCELLENT;
    private final String address;
    private final Date dateOfBirth;

    private Student(final String name,
               final Integer age,
               final String grede,
               final String address,
               final Date dateOfBirth) {
        this.name = name;
        this.age = age;
        this.grede = grede;
        this.address = address;
        this.dateOfBirth = dateOfBirth;
        System.out.println("Student : " + name+ " is created");
    }

    public static class Builder {
        private String name;
        private Integer age;
        private String grede;
        private String address;
        private Date dateOfBirth;

        public Student.Builder withName(final String name) {
            this.name = name;
            return this;
        }

        public Student.Builder withAge(final Integer age) {
            this.age = age;
            return this;
        }

        public Student.Builder withGrade(final String grade) {
            this.grede = grade;
            return this;
        }

        public Student.Builder withAddress(final String address) {
            this.address = address;
            return this;
        }

        public Student.Builder withDateOfBirth(final Date dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public Student bulid() {
            if (name == null ||
                    age == null ||
                    grede == null ||
                    address == null ) {
                throw new IllegalStateException("Cannot create Pet");
            }
            return new Student(name, age, grede, address, dateOfBirth);
        }
    }
}
```

  
    
## 2. Strategy Pattern
- 세부 구현을 변경하지 않고 내부 알고리즘을 교환 가능(캡슐화)한 디자인 패턴으로 해당 알고리즘을 사용하는 클라이언트의 변경 없이 독립적으로 변경이 가능하다.   
- 아래 샘플 코드의 경우 새로운 기능의 추가(ex. qa worker 추가 등.. )가 기존의 코드(Worker/WorkProject) 에 영향을 미치지 못하게 하므로 OCP를 만족 하는 설계가 된다.


> 스트리지 패턴으로 Woker 구현 하기
```java
public interface Worker {
    void work();    
    void rest();
}
public class DesignWorker implements Worker{
    @Override
    public void work(){
        System.out.printf("drawing Something...");
    }
    @Override
    public void rest(){    
        System.out.printf("walk outside...");
    }
}
public class ProgrammerWoker {
    @Override
    public void work(){
        System.out.printf("debugging Something...");
    }

    @Override    
    public void rest(){
        System.out.printf("drink coffee..");    
    }
}
```
- Worker interface를 통해서 각각의 worker들이 무슨일을 하는지 신경쓰지않고 개발이 가능하다.

> Worker를 사용하기 위한 Project class 선언  
```java
public class WorkProject {
    private final Worker worker;
    
    public WorkProject(Worker worker) {
        this.worker = worker;
    }
    
    public void doProject(){
        worker.work();
        worker.rest();
        worker.work();
    }
}
```
- worker를 주입받아 사용한다. 

> 스트레티지 패턴을 이용한 WorkProject 수행 Test sample code
```java
@Test
public void designProject(){
    final WorkProject workProject = new WorkProject(new DesignWorker());
    workProject.doProject();
}
```
- 디자인프로젝트 생성
- 결과

```java
@Test
public void programmingProject(){
    final WorkProject workProject = new WorkProject(new ProgrammerWoker());
    workProject.doProject();
}
```
- 프로그래밍프로젝트 생성
- 결과



### 3. Template Pattern


### 4. Decorator pattern


### 5. Flyweight pattern
- 여러개의 객체에 많은 값을 공유해야 하는 경우에 유용하게 사용한다. 인스턴스가 사라지지 않는 한 값을 공유 할 수 있다.  
- 즉, 객체가 내부에서 참조하는 값을 직접 생성하지 않고 없으면 생성, 있다면 해당 객체를 공유하는 방식이다. 

- 객체 할당에 사용되는 메모리를 줄일 수 있고, 객체를 생성하는 시간도 감소 시킬 수 있다.  -> garbage collection의 감소

- 자바에서의 String, Integer클래스등이 해당 패턴으로 구현되어있다.
- 주 사용처는 게임..?

> 플라이웨이트 패턴이 적용된 Java Integer class의 valueOf 메서드

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];     //기존 인스턴스 반환
    return new Integer(i);                                                          //신규 인스턴스 반환
}
```
- valueOf 메서드는 매개변수로 들어온 i값을 확인하고 이전에 캐시된 값이면 기존 인스턴스를 반환한다. 

> 플라이웨이트 패턴 Test sampleCode 
```java
@Test
public void sameIntegerInstance(){
    final Integer a = Integer.valueOf(16);
    final Integer b = Integer.valueOf(16);
    Assert.assertSame(a,b);

    final Integer c = Integer.valueOf(50);
    final Integer d = Integer.valueOf(50);
    Assert.assertSame(a,b);
}
```
- Integer.ValueOf() 사용
```java
@Test
public void sameStringInstance(){
    String s = "hello";
    String s1 = new String("hello");
    String s2 = "hello";

    System.out.println("s == s1 ? " + (s == s1));
    System.out.println("s == s2 ? " + (s == s2));
}
```
- String class 사용

## 6. SingleTone pattern


