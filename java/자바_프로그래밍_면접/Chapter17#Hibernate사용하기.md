# Chapter17 하이버네이트 사용하기


## 하이버네이트 사용하기 
  
#### ` Q1. 어떻게 하이버네이트를 사용해서 자바 객체를 만드는가?`\

- 하이버네이트를 데이터베이스 관계를 통해 객체레 매핑하는 도구로 반드시 도메인 객체가 있어야 한다.
- 클래스들은 POJO구조로 데이더 베이스와 간당히 연결된다. 
```java
public class Person {
    private int id;
    private String name;
    private String address;

    public Person() {
    }
    
    public Person(int id, String name, String address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }

    public int getId() { return id; }
    public void setId(int id) {this.id = id;}
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}
    public String getAddress() {return address;}
    public void setAddress(String address) {this.address = address;}

    @Override
    public String toString() {
    return "Person{ name='" + name 
                   + ", address='" + address 
                   + "}";
    }
}
``` 
- 테이블 명은 복수형 단어, 객체는 단수형을 갖는다 (people 테이블, Person클래스)
- 하이버네이트는 객체를 만들때 생성자가 아닌 setter를 이용하므로 인자가 없는 생성자를 반드시 포함해야한다. 
- 또한 필드들을 final로 선언하면 안된다.

- 이제 테이블과 클래스사이의 맵핑을 명시해보자  
  : 네이밍 룰은 <Entity>.hbm.xml이다.   
  : 열과 필드가 자동으로 매핑되며 id 필드로 식별자(PK)만 등록해준다. 
```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
 "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
 "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">
<hibernate-mapping package="com.sunny.acinginterview.chapter17">
    <class name="Person" table="PEOPLE">
        <id name="id" column="ID"/>
        <property name="name"/>
        <property name="address"/>
    </class>
</hibernate-mapping>
```

- 데이터베이스와 경로등을 설정해주는 hibernate.cfg.xml파일을 생성하자  
:  DB연결 속성을 관리하는 파일로 커넥션풀, 캐싱등을 설정한다. 
```xml
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE hibernate-configuration PUBLIC
 "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
 "http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="connection.driver_class">
            com.mysql.jdbc.Driver
        </property>
        <property name="connection.url">
            jdbc:mysql://localhost:3306/ticketoffice
        </property>
        <property name="connection.username">nm</property>
        <property name="connection.password">password</property>
        <property name="dialect">
            org.hibernate.dialect.MySQLDialect
        </property>
        <property name="show_sql">true</property>
        <mapping resource="com/sunny/javainterviewsexposed/chapter17/Person.hbm.xml"/>
    </session-factory>
</hibernate-configuration>
```
 - DB데이터 상태 
```command
mysql> select * from people;
+----+----------------+-------------------+
| id | name | address |
+----+----------------+-------------------+
| 1 | Sunny Woo| 29, Guui-dong |
| 2 | Ted Park | 74A, GwangJu |
| 3 | Cindy Kim| 1, SK Hub Pangyo |
+----+----------------+-------------------+
3 rows in set (0.00 sec)
```

- 연결 테스트
```java
@Test
public void retrievePeople() {
    final SessionFactory sessionFactory =
            new Configuration()
            .configure()
            .buildSessionFactory();
    final Session session = sessionFactory.openSession();
    final List<Person> actual = session
            .createQuery("from Person")
            .list();
    final List<Person> expected = Arrays.asList(
        new Person(1, "Sunny Woo", "29, Guui-dong"),
        new Person(2, "Ted Park", "74A, GwangJu "),
        new Person(3, "Cindy Kim", "1, SK Hub Pangyo")
    );
    assertEquals(expected, actual);
}
```
#### ` Q2. 어떻게 하이버네이트를 이용해서 데이터베이스에 데이터를 입력하는가?`
```java
public void storePerson() throws SQLException {
    final Session session = sessionFactory.openSession();
    final Transaction transaction = session.beginTransaction();
    final Person newPerson = new Person(4, "Bruce Wayne", "Gotham City");
    
    session.save(newPerson);
    transaction.commit();
    
    final Connection conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/ticketoffice",
            "nm",
            "password");
    final Statement stmt = conn.createStatement();
    final ResultSet rs = stmt.executeQuery("select name from people where id = 4");

    assertTrue(rs.next());
    assertEquals("Bruce Wayne", rs.getString(1));

    rs.close();
    stmt.close();
    conn.close();
}
```
- 단순히 Person객체를 사용해서 hibernate세션에 save함수를 호출하면 된다.
- id가 식별자이며 이를 자동으로 입력되도록 변경해보자  

테이블 변경 : AUTO_INCREMENT속성을 정의한다. 
```sql
CREATE TABLE people (
 id INTEGER AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100),
 address VARCHAR(100)
);
```
Person.hbm.xml변경 : generator에 native속성을 넣어준다. 
```xml
<class name="Person" table="PEOPLE">
    <id name="id" column="ID">
        <generator class="native"/>
    </id>
    <property name="name"/>
    <property name="address"/>
</class>
```

결과   
 -> 실행 sql변경됨
```sql
Hibernate: insert into PEOPLE (name, address) values (?, ?)
```
 -> Person에 id 필드 삭제
```java
public class Person {
 private String name;
 private String address;
... 
```

#### ` Q3. 하이버네이트를 이용한 데이버테이스 조인은 어떻게 하는가?`
- 티켓과 이벤트 테이블 데이터 
```command
mysql> select * from tickets;
+----+----------+
| id | event_id |
+----+----------+
| 1 | 1 |
| 2 | 1 |
| 3 | 2 |
| 4 | 2 |
| 5 | 3 |
| 6 | 3 |
| 7 | 4 |
| 8 | 5 |
| 9 | 5 |
| 10 | 6 |
+----+----------+
10 rows in set (0.00 sec)
mysql> select * from person_ticket;
+-----------+-----------+
| person_id | ticket_id |
+-----------+-----------+
| 1 | 1 |
| 2 | 4 |
| 1 | 7 |
| 3 | 10 |
+-----------+-----------+
4 rows in set (0.00 sec)
```

- N:M 관계 조인 하기  
->  Ticket클래스 생성 (생략)  
->  Ticket.hbm.xml 생성 Person.hbm.xml 수정  
->  Person클래스에 컬렉션 필드 추가 

```xml
<hibernate-mapping package="com.sunny.javainterviewsexposed.chapter17">
    <class name="Ticket" table="TICKETS">
    <id name="id" column="ID"/>
    <property name="eventId" column="event_id"/>
    </class>
</hibernate-mapping>
```
```xml
<hibernate-mapping package="com.sunny.javainterviewsexposed.chapter17">
 <class name="Person" table="PEOPLE">
    <id name="id" column="ID">
        <generator class="native"/>
    </id>
    <property name="name"/>
    <property name="address"/>
    <set name="tickets" table="PERSON_TICKET" cascade="all">
        <key column="person_id"/>
        <many-to-many column="ticket_id"
        unique="true"
        class="Ticket"/>
    </set>
 </class>
</hibernate-mapping>
```

key column 태그로 조인을 어떻게 실행 할지 알려준다.   
->  person_ticket ㅌ[이블의 person_id컬럼으로   
many-to-many 태그는 Ticket의 개체 식별자(PK)를 참조한다 

이제 hibernate.cfg.xml가 새 엔티티.hbm.xml 들을 참조한다  
Person클래스에 컬랙션 필드도 추가해주어야한다. 
```java
public class Person {
    private int id;
    private String name;
    private String address;
    private Set<Ticket> tickets;
    public Person() { }
    public Person(int id,
        String name,
        String address,
        Set<Ticket> tickets) {
    ...
```

- 1:N 관계 조인 하기   
->  Event클래스 생성 (생략)  
->  Event.hbm.xml 생성 Ticket.hbm.xml 수정  
->  Ticket 클래스는 생성자로 id와 Event를 받는다.

```xml
<hibernate-mapping package="com.wiley.acinginterview.chapter17">
    <class name="Ticket" table="TICKETS">
        <id name="id" column="ID"/>
        <many-to-one name="event" class="Event"
            column="event_id" cascade="all" not-null="true"/>
     </class>
</hibernate-mapping>
```
```java
final Set<Ticket> dominicTickets = 
    new HashSet<Ticket>(1) {
    { add(new Ticket( 4,
                     new Event( 2,  1, "The Super Six", new DateTime(2013, 8, 1, 0, 0).toDate())
                    )
         );
    }
};
```
- 테스트 하기 
```java
@Test
public void retrievePeople() {
 final SessionFactory sessionFactory = new Configuration().configure().buildSessionFactory();
 final Session session = sessionFactory.openSession();
 final List<Person> actual = session.createQuery("from Person").list();

 final Set<Ticket> sunnyTickets = new HashSet<Ticket>(2) {{
    add(new Ticket(1, 1));
    add(new Ticket(7, 4));
 }};
 final Set<Ticket> tedTickets = new HashSet<Ticket>(1) {{
    add(new Ticket(4, 2));
 }};
 final Set<Ticket> cindyTickets = new HashSet<Ticket>(1) {{
    add(new Ticket(10, 6));
 }};

 final List<Person> expected = Arrays.asList(
    new Person(1, "Sunny Woo", "29, Guui-dong", sunnyTickets),
    new Person(2, "Ted Park", "74A, GwangJu ", tedTickets),
    new Person(3, "Cindy Kim", "1, SK Hub Pangyo", cindyTickets));
 
 assertEquals(expected, actual);
 ```

#### ` Q4. HQL은 어떻게 사용하는가?`

- SQL 이랑 뭐 거의 비슷..

- 단일 사용자를 검색하는 HQL구문  
 : like 'Dominic%' 은 Dominic으로 시작하는 사람만 추출한다 (예제에서는 1명만 리턴됨)
```java
@Test
public void hqlSinglePerson() {
    final Session session = sessionFactory.openSession();
    final List<Person> singleUser = session
    .createQuery("from Person where name like 'Dominic%'")
    .list();
    assertEquals(1, singleUser.size());
}
```

- 객체의 필드에 질의하기   
 : Person의 ticket클래스 검색하기   
 : 특정 필드만 검색하므로 select로 쿼리를 실행해야 한다. 
```java
 @Test
public void hqlSpecificTickets() {
    final Session session = sessionFactory.openSession();

    final List<Ticket> actual = session.createQuery("" +
        "select person.tickets " +
        "from Person person " +
        "where person.name = 'Eric Twinge'").list();
    
    assertEquals(2, actual.size());
} 
```

- 다양한 레벨의 하이버네이트 질의하기 
```java
@Test
public void hqlVenuesForPerson() {
    final Session session = sessionFactory.openSession();
    final List actual = session.createQuery("" +
    "select event.eventName " +
    "from Person person " +
    "inner join person.tickets as tickets " +
    "inner join tickets.event as event " +
    "where person.name = 'Eric Twinge'").list();
    assertEquals(Arrays.asList("The Super Six", "David Smith"), actual);
}
```
#### ` Q5. 하이버네이트는 성능에 어떤 영향을 미치는가?`
- 기본적으로 하이버네이트를 개체를 검색할때 의존성이 있는 모든 개체가 동시에 검색된다.
- 하이버네이트를 지연시간을 두고 개체를 로드한다. 즉, 쿼리는 필요시에 실행된다.

- Person개체 검색시 Ticket과 Evnent에 대한 참조가 지연되도록 설정한다.  
 : 매핑 속성에 lazy="true"를 추가한다. 
```xml
<hibernate-mapping package="com.wiley.acinginterview.chapter17">
    <class name="Ticket" table="TICKETS">
        <id name="id" column="ID"/>
        <many-to-one name="event"
            class="Event"
            column="event_id"
            cascade="all"
            not-null="true"
            lazy="true"/>
    </class>
</hibernate-mapping>
```
- 실제 지연되는지 확인을 위해  
  -> show_sql 속성을 활성화 한 뒤 하이버네이틑 로그에서 쿼리를 확인한다.   
  -> Event객체가 생성되는 갯수를 유지하게한뒤 원할때 생성수를 확인한다. 


