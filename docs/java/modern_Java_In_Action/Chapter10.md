# Chapter10# 람다를 이용한 도메인 전용 언어
개발자들은 대부분 NullPointException이 겪어봤을 것이다.  
 

## 1. 도메인 전용 언어? 
DSL에서의 동작과 용어는 특정 도메인에 국한되므로 자신앞에 놓인 문제를 해결하는데에만 집중 할 수 있다. 
다음 두 가지 필요성을 생각하면서 DSL을 개발해야한다.
- **의사소통의 왕**   
코드의 의도가 명호가하게 전달되어야하며 프로그래머가 아닌 사람도 이해가능해야 한다. 
- **코드를 한번 구현하지만 여러번 읽는다**  
가독성은 유지보수의 핵심으로 coworker가 쉽게 이해하도록 구현해야한다. 



### `1.1 DSL의 장단점`
**장점**
- 간결함  
: API비지니스 로직을 간편하게 캡슐화 하므로 반복을 피하고 소스를 간결하게 만들 수 있다.
- 가독성  
: 도메인 영역의 용어를 사용하므로 비 도메인 전문가도 코드를 쉽게 이해할 수 있다.  
결과적으로 다양한 구성원들간에 코드와 도메인 영역이 공유될 수 있다.
- 유지보수  
: 잘 설계된 DSL로 구현한 코드는 쉽게 유지보수하고 바꿀 수 있다.
- 높은 수준의 추상화  
: DSL은 도메인과 같은 추상화 수준에서 동작하므로 도메인의 문제와 직접적으로 관련되지 않은 세부사항을 숨긴다.
- 집중  
: 바지니스 도메인의 규직을 표현할 목적으로 설계된 언어이므로 프로그래머가 특정코드에 집중해 생산성이 향상된다.
- 관심사분리  
: 지정된 언어로 비지니스 로직을 표현함으로서 어플리케이션 인프라 구조 관련문와 독릭적으로 비지니스 관련된 코드에 집중하기 용이하다. > 유지보수가 쉬운 코드를 구현한다.

**단점**
- DSL설계의 어려움  
: 간결하게 제한된 언어에 도메인 지식을 담는것은 쉬운일이 아니다.
- 개발 비용  
: 코드에 DSL을 추가하는 작업은 초기 프로젝트에 많은 비용과 시간이 소요된다.   
또한, DSL 유지보수와 변경은 프로젝으에 많은 부담인 된다.
- 추가 우회 계층
: DSL은 추가적인 계층으로 도메인 모델을 감싸며 이때 계층을 최대한 작게 만들어 성능 문제를 피한다.
- 새로 배워야 하는 언어  
: DSL을 추가하면서 배워야하는 언어가 더 늘어난다. 여러 도메인의 DSL 사용하는 경우는 부담된다. 
- 호스팅 언어 한계  
: 


### `1.2 JVM에서 이용 할 수 있는 다른 DSL 해결책`

DSL을 구분하는 가장 흔한방법은 내부/외부로 나누는 것이다.  
내부(임베디드)DSL은 순수자바 코드와 같은 호스팅언어로, 외부DSL(strandalon)은 독립적으로 자체 문법을 가진다.  
JVM으로 내부/외부DSL의 중간에 해당하는 DSL이 만들어질 가능성도 있다.  
그루비나 스칼라처럼 가바가 아니지만 JVM에서 실행되는 유연하고 강력한 언어들이 있다.   
이들을 다중 DSL라고 칭한다.  

`**(1) 내부DSL**`

- 자바는 람다가 등장하며 DSL을 만들기 간편해졌다.  
- 람다를 적극적으로 활용하면 익명내부클래스를 사용해 DSL을 구현하는것 보다 장황함을 줄일 수 있다.  
- 자바 7과 8을 비교하여 살펴보자 
```java
List<String> numbers = Arrays.asList("one", "two", "three");
*numbers.forEach* (new Consumer<String>() {
    @Override
    public void *accept*( String s ) {
        *System.out.println(s)*;
    }
} );
```
- 위 코드에서 **로 표시된 구문들이 코드의 잡음이다. 
- 이를 아래처럼 줄일 수 있다. 
```java
//람다사용
numbers.forEach(s -> System.out.println(s));
//메서드 참조 사용
numbers.forEach(System.out::println);
```

**자바를 이용하여 DSL을 만들때의 장점을 알아보자**

- 기존 자바를 이용하면 외부 DSL에 비해 새로운 패턴과 기술을 배우는 노력이 줄어든다.
- 순수 자바로 DSL을 구현하면 나머지 코드와 함께 컴파일이 가능하다.  
따라서 다른 컴파일러나 DSL만드는 도구를 사용할 필요가 없어 추가비용이 들지 않는다.
- 개발팀이 새로운 언어나 복잡한 외두 도구를 배울 필요가 없다.
- DSL사용자는 기존의 IDE를 이용해 자동완성, 자동 리펙토링을 그대로 사용 가능한다.
- 다른 도메인을 위해 추가 DSL을 개발하는 경우 쉽게 합칠 수 있다.   

->  ??? 결국 익숙하고 호환성좋고 편하단얘기를 잘 써놧네.. 


`**(2) 다중 DSL**`
- JVM에서 지원되는 프로그래밍 언어는 다양하다. 
- DSL은 기반 프로그래밍언어의 영향을 받으므로 간결한 DSL을 위해선 언어특성이 중요하다. 
- 특히 스칼라가 DSL 개발에 필요한 여러 특성을 잘 가지고 있다.(커링,임의변환 등)

- 주어진 함수 f를 주어진 횟수만큼 실행하는 유틸리티 함수를 구현해보자
- i가 커져도 StackOverFlow는 발생하지 않는다.(스칼라 꼬리호출최적화..?) 
```scala
def times(i: Int, f: => Unit): Unit = {
  f                             // 함수 f 실행
  if (i > 1) times(i - 1, f)    // 횟수가 양수인 동안 재귀호출
}
```

- 위 함수를 이용해 'Hello World!'를 세번 출력해보자
```scala
times(3, println("Hello World"))
```

- time 함수를 커링하거나 두 그룹으로 인수를 놓을 수 있다.
```scala
def times(i: Int)(f: => Unit): Unit = {
  f
  if (i > 1 times(i - 1)(f)
}
```

- 여러번 실행할 명령을 중괄호 안에 넣어 같은 결과를 얻을 수 있다. 
```scala
times(3) {
  println("Hello World")
}
```

- 마지막으로 함수가 반복할 인자를 받는 한 함수를 가지면서 Int를 익명클래스로 암묵적으로 변환하도록 정의할 수 있다. 
```scala
implicit def intToTimes(i: Int) = new { 
    //Int를 무명클래스로 받는 암묵적 변환 정의
  def times(f: => Unit): Unit = { 
    // 이 클래스는 다른 함수 f를 인수로 받는 times함수를 하나만 정의
    def times(i: Int, f: => Unit): Unit = { 
    // 두번쨰 times는 가장 가까운 범주에서 정의한 두개 인수를 받는 함수를 이용
      f
      if (i > 1) times(i - 1, f)
    }
    times(i, f)
  }
}
```

- 위처럼 스칼라 DLS를 구현하고 'Hello World!'를 출력하라고 아래처럼 명령이 가능하다.
- 숫자 3은 자동으로 컴파일러에 의해 클래스 인트턴스로 변환되며, i필드에 저장된다. 
```scala
3 times {
  println("Hello World")
}
```

- 자바로 위 같은 결과를 얻긴 어렵다. 스칼라가 더 DSL 친화적이다.
- 하지만 불편한 점들도 존재한다  
: 새로운 프로그래밍 언어를 배우어나 누가 이미 알고있어야한다.  
: 두개 이상의 언어다 혼재하므로 여러 컴파일러로 빌드되도록 개선해야한다.  
: JVM에서 돌아가는 언어들이 자바와 100%호환된다고 주장하지만....  
  ex)스칼라와 자바의 컬렉션을 호환되지 않아 기존 콜랙션의 API변환이 필요하다. 


`**(3) 외부 DSL**`
- 외부 DSL은 새언어를 파싱하고, 파서 결과를 분석하고 외부 DSL을 실행할 코드를 만들어야하므로 작업이 크고 어렵다.
- 외부 DSL개발의 장점은 무한한 유연성이다.   
- 우리에게 필요한 특성을 완벽하게 제공하는 설계를 할 수 있다. 
- 제대로만 설계한다면 가독성이 좋은 언어를 얻을 수 있을것이다. 
- 자바로 구현한 인프라구조 소스와 외부 DSL로 구현한 비지니스 로직을 구별할 수 있다. 
- 다만, DLS언어와 호스트 언어사이의 인공계층이 발생하는 문제도 야기한다.

## 2. 최신 자바 API의 DSL
- 자바의 람다와 메서드 참조가 등장하며 DSL관점으로 판도가 바뀌었다.
- Comparator 인터페이스 예제를 통해 람다가 네이티브자바에 비해 가독성, 재활용성, 메소드 결합도를 높였는지 확인해보자

- 사람 객체를 나이순으로 정렬해보자. 
```java
//람다가 없으면 내부 클래스로 Comparator 인터페이스를 구현해야한다.
Collections.sort(persons, new Comparator<Person>() {
    public int compare(Person p1, Person p2) {
        return p1.getAge() - p2.getAge();
    }
});

//내부 클래스를 람다표현식으로 바꾸자
Collections.sort(people, (p1, p2) -> p1.getAge() - p2.getAge());

//Comparator.comparing 메서드를 임포트해서 아래처럼 변경 가능하다.
Collections.sort(persons, comparing(p -> p.getAge()));

//람다를 메서드 참조로 대신해서 코드개선도 가능하다. 
Collections.sort(persons, comparing(Person::getAge));
```
- 위 API들은 컬렉션 정렬 도메인의 최소 DSL이다. 
- 매우 작은 영역이지만 람다와 메서드 참조를 이용해 DSL이 가독성, 재활용성, 결합성을 높이는것을 확인해보았다. 


### `2.1 스트림 API는 컬렉션을 조작하는 DSL`
- Stream 인터페이스는 네이티브 자바 API에 DSL을 적용한 좋은 예이다.
- 컬렉션의 항목을 필터, 정렬, 변환, 그룹화, 조작하는 강력한 DSL이다. 

- 로그파일을 읽어 'ERROR'로 시작하는 파일의 첫 40행을 수집하는 작업을 처리해보자.
```java
List<String> errors = new ArrayList<>();
int errorCount = 0;
BufferedReader bufferedReader
    = new BufferedReader(new FileReader(fileName));
String line = bufferedReader.readLine();
while (errorCount < 40 && line != null) {
    if (line.startsWith("ERROR")) {
        errors.add(line);
           errorCount++;
    }
    line = bufferedReader.readLine();
}
```
- 일부 에러처리 코드는 생략했음에도 가독성과 유지보수성이 매우 떨어진다. 
- 같은 기능을 하는 코드가 여러행에 분산되어 있다.  
: FileReader가 만들어짐  
: 파일이 종료되었는지 확인하는 while의 두번째 조건  
: 파일의 다음 행을 읽는 while의 마지막 행
 
- 또한, 첫 40행을 수집하는 코드도 세 부분으로 흩어져있다.  
: errorCount변수를 초기화 하는 코드  
: while 루프의 첫번째 조건  
: 'Error'를 로그에서 발견시 count를 증가하는 행

- Stream을 인터페이스를 이용해 함수형으로 개선하면 코드가 쉽고 간결해진다. 
```java
List<String> errors = Files.lines(Paths.get(fileName)) //파일을 열어서 스트림을 만든다. 
                           .filter(line -> line.startsWith("ERROR")) //'Error'로 시작하는 행 필터링
                           .limit(40) //40행만 가져오기 
                           .collect(toList()); //결과를 리스트로 수집
```

### `2.2 데이터 수집 DSL인 Collectors`
- Collectors 인터페이스도 데이터 수집을 집행하는 DSL이다.
- 특히 Comparator 인터페이스는 다중 필드 정렬을 지원하도록 합쳐질수 있고,  
Collectors는 다중 수준 그룹화를 달성하도록 합쳐질수 있다.
- 아래 예제를 보면 자동차를 브랜드별, 생상별로 그룹화 할 수 있다.
- 두 Comparator를 연결하는 것과 달리 플루언트 방식으로 연결해 다중 필드 Comparator를 정의했다. 
```java
Map<String, Map<Color, List<Car>>> carsByBrandAndColor =
        cars.stream().collect(groupingBy(Car::getBrand,
                                         groupingBy(Car::getColor)));

Comparator<Person> comparator =
        comparing(Person::getAge).thenComparing(Person::getName);

```
- Collectors API를 이용해서 Collectors를 중첩해 다중수준 Collector를 만들 수 있다.
```java
Collector<? super Car, ?, Map<Brand, Map<Color, List<Car>>>>
   carGroupingCollector =
       groupingBy(Car::getBrand, groupingBy(Car::getColor));
```

- 셋 이상의 컴포넌트를 조합할때는 플루언트 형식이 중첩에 비해 가독성이 좋다.
- 가장 안쪽의 Collector가 첫번째로 평가되어야 하나 논리적으로는 최종 그룹화에 해당한다. 

- groupingBy 팩터리 메서드에 작업을 위임하는 GroupingBuilder로 문제를 해결해보자 
```java
import static java.util.stream.Collectors.groupingBy;

public class GroupingBuilder<T, D, K> {
    private final Collector<? super T, ?, Map<K, D>> collector;

    private GroupingBuilder(Collector<? super T, ?, Map<K, D>> collector) {
        this.collector = collector;
    }

    public Collector<? super T, ?, Map<K, D>> get() {
        return collector;
    }

    public <J> GroupingBuilder<T, Map<K, D>, J>
                       after(Function<? super T, ? extends J> classifier) {
        return new GroupingBuilder<>(groupingBy(classifier, collector));
    }

    public static <T, D, K> GroupingBuilder<T, List<T>, K>
                     groupOn(Function<? super T, ? extends K> classifier) {
        return new GroupingBuilder<>(groupingBy(classifier));
    }
}
```

- 플루언트 형식 빌더에는 중첩그룹과 반대로 그룹화 함수를 구현해야한다.
- 따라서 코드가 직관적이지 않고 자바형식으로를 순서문제 해결이 불가하다. 
```java
Collector<? super Car, ?, Map<Brand, Map<Color, List<Car>>>>
   carGroupingCollector =
       groupOn(Car::getColor).after(Car::getBrand).get()
```

## 3. 자바로 DSL을 만드는 패턴과 기법
- 예제 도메인은 세가지이다. 주식(Stock), 거래(Trade), 주문(Order)
- 주어진 시작에 주식 가격을 모델링 하는 순수 자바 빈즈
```java
public class Stock {
    private String symbol;
    private String market;

    public String getSymbol() { return symbol;}
    public void setSymbol(String symbol) { this.symbol = symbol;}

    public String getMarket() { return market;}
    public void setMarket(String market) { this.market = market;}
}
```
- 주어진 가격에서 주식을 파는 사거나 파는 거래 (Trade)
```java
public class Trade {
    public enum Type { BUY, SELL }
    private Type type;

    private Stock stock;
    private int quantity;
    private double price;

    public Type getType()  { return type;}
    public void setType(Type type) { this.type = type;}

    public int getQuantity() { return quantity;}
    public void setQuantity(int quantity) { this.quantity = quantity;}

    public double getPrice() { return price;}
    public void setPrice(double price) { this.price = price;}

    public Stock getStock() { return stock;}
    public void setStock(Stock stock) { this.stock = stock;}

    public double getValue() { return quantity * price;}
}
```
- 고객이 요청한 1개 이상의 주문 
```java
public class Order {
    private String customer;
    private List<Trade> trades = new ArrayList<>();

    public void addTrade(Trade trade) { trades.add(trade);}

    public String getCustomer() { return customer;}
    public void setCustomer(String customer) { this.customer = customer;}

    public double getValue() { return trades.stream().mapToDouble(Trade::getValue).sum();}
}
```
- BigBank라는 고객이 요청한 두개의 거래를 주문을 의미하는 객체를 만들어보자.
```java
Order order = new Order();
order.setCustomer("BigBank");

Trade trade1 = new Trade();
trade1.setType(Trade.Type.BUY);

Stock stock1 = new Stock();
stock1.setSymbol("IBM");
stock1.setMarket("NYSE");

trade1.setStock(stock1);
trade1.setPrice(125.00);
trade1.setQuantity(80);
order.addTrade(trade1);

Trade trade2 = new Trade();
trade2.setType(Trade.Type.BUY);

Stock stock2 = new Stock();
stock2.setSymbol("GOOGLE");
stock2.setMarket("NASDAQ");

trade2.setStock(stock2);
trade2.setPrice(375.00);
trade2.setQuantity(50);
order.addTrade(trade2);
```
- 코드가 굉장히 장황하다.
- 비개발자가 이해하고 검증하기 어렵다.
- DSL을 만들어서 바꿔보자


### `3.1 메서드체인`
- 가장 흔한방식으로, 한개의 메서드 호출 체인으로 거래 주문의 정의가 가능하다. 
- 아래는 체인 방식으로 생성한 거래 주문이다. 
```java
Order order = forCustomer( "BigBank" )
                  .buy( 80 )
                  .stock( "IBM" )
                      .on( "NYSE" )
                  .at( 125.00 )
                  .sell( 50 )
                  .stock( "GOOGLE" )
                      .on( "NASDAQ" )
                  .at( 375.00 )
              .end();
```
- 빌더를 통해 DSL를 구현할 수 있다.
- 최상위 수준의 빌더를 만들어서 주문을 감싸고 한개 이상의 거래를 주문에 포함해야 한다.

- 주문빌더 
- buy와 sell함수를 다른 주문을 추가할 수 있게 자신을 반환한다. 
```java
public class MethodChainingOrderBuilder {

    public final Order order = new Order();

    private MethodChainingOrderBuilder(String customer) {
        order.setCustomer(customer);
    }

    public static MethodChainingOrderBuilder forCustomer(String customer) {
        return new MethodChainingOrderBuilder(customer);
    }

    public TradeBuilder buy(int quantity) {
        return new TradeBuilder(this, Trade.Type.BUY, quantity);
    }

    public TradeBuilder sell(int quantity) {
        return new TradeBuilder(this, Trade.Type.SELL, quantity);
    }

    public MethodChainingOrderBuilder addTrade(Trade trade) {
        order.addTrade(trade);
        return this;
    }

    public Order end() {
        return order;
    }
}
```
- 빌더를 이어가기 위해서 Stock인스턴스를 만드는 TradeBuilder의 메서드를 이용해야 한다.
```java
public class TradeBuilder {
    private final MethodChainingOrderBuilder builder;
    public final Trade trade = new Trade();

    private TradeBuilder(MethodChainingOrderBuilder builder,
                         Trade.Type type, int quantity) {
        this.builder = builder;
        trade.setType( type );
        trade.setQuantity( quantity );
    }

    public StockBuilder stock(String symbol) {
        return new StockBuilder(builder, trade, symbol);
    }
}
```

- StockBuilder는 주식시장을 지정하고 거래에 주식을 추가하고 최종빌더를 반환하는 on메서드를 정의한다. 
```java
public class StockBuilder {
    private final MethodChainingOrderBuilder builder;
    private final Trade trade;
    private final Stock stock = new Stock();

    private StockBuilder(MethodChainingOrderBuilder builder,
                         Trade trade, String symbol) {
        this.builder = builder;
        this.trade = trade;
        stock.setSymbol(symbol);
    }

    public TradeBuilderWithStock on(String market) {
        stock.setMarket(market);
        trade.setStock(stock);
        return new TradeBuilderWithStock(builder, trade);
    }
}
```

- TradeBuilderWithStock 는 거래되는 주식의 단위 가격을 성정한다음 원래 주문빌더를 반환한다. 
```java
public class TradeBuilderWithStock {
    private final MethodChainingOrderBuilder builder;
    private final Trade trade;

    public TradeBuilderWithStock(MethodChainingOrderBuilder builder,
                                 Trade trade) {
        this.builder = builder;
        this.trade = trade;
    }

    public MethodChainingOrderBuilder at(double price) {
        trade.setPrice(price);
        return builder.addTrade(trade);
    }
}
```

- 이 기법을 사용하면 사용자가 미리 지정된 절차에 따라 API를 호출하도록 강제한다.
- 또한 주문에 사용한 파라미터가 내부 빌더로 국한되는 이점도 있다.
- 따라서 정적메소드 사용을 최소화하고 메서드 명이 인수명을 대신하므로 가독성이 개선된다.
- 하지만, 빌더를 구현해야하고 상위,하위빌더를 연결하도록 접착코드가 필요하다. 
- 들여쓰기를 강제할수 없다는 단점존재한다. 

### `3.2 중첩된 함수 이용`
```java
- 다른 함수 안에 함수를 이용해 도메인 모델을 만든다. 
- 아래는 중첩된 함수 방식으로 생성한 거래 주문이다. 
Order order = order("BigBank",
                    buy(80,
                        stock("IBM", on("NYSE")),
                        at(125.00)),
                    sell(50,
                         stock("GOOGLE", on("NASDAQ")),
                         at(375.00))
                   );
```
- 중첩된 함수 DSL을 제공해주는 주문빌더 
```java
public class NestedFunctionOrderBuilder {

    public static Order order(String customer, Trade... trades) {
        Order order = new Order(); //해당 고객의 주문만들기
        order.setCustomer(customer);
        Stream.of(trades).forEach(order::addTrade); //주문에 모든 거래 추가
        return order;
    }

    public static Trade buy(int quantity, Stock stock, double price) {
        return buildTrade(quantity, stock, price, Trade.Type.BUY);
        // 주식 매수 거래 만들기
    }

    public static Trade sell(int quantity, Stock stock, double price) {
        return buildTrade(quantity, stock, price, Trade.Type.SELL);
        // 주식 매도 거래 만들기
    }

    private static Trade buildTrade(int quantity, Stock stock, double price,
                                    Trade.Type buy) {
        Trade trade = new Trade();
        trade.setQuantity(quantity);
        trade.setType(buy);
        trade.setStock(stock);
        trade.setPrice(price);
        return trade;
    }

    public static double at(double price) { //거래 단가 정의 더미메소드
        return price;
    }

    public static Stock stock(String symbol, String market) {
        Stock stock = new Stock(); //거래된 주식만들기
        stock.setSymbol(symbol);
        stock.setMarket(market);
        return stock;
    }

    public static String on(String market) { //주식이 거래된 시장 정의 더미메소드
        return market;
    }
}
```
- 메서드 체인에 비해 도매인 객체 계증구조에 그대로 반영되는게 장점이다.
- SQL에 괄호가 많이 생기는게 단점이다.
- 또한 인수 목록도 정적메소드에 넘겨줘여하낟. 
- 인수가 생략되는 경우에 대비해서 오버라이딩을 많이 해줘야한다.
- 인수 의미가 인수 명이 아닌 위치(순서)에 의해 정의되었다. 
- 더미 메서드를 이용해서 조금 완화는 가능하다. 

### `3.3 람다 표현을 이용한 함수 시퀀싱`
```java
Order order = order( o -> {
    o.forCustomer( "BigBank" );
    o.buy( t -> {
        t.quantity( 80 );
        t.price( 125.00 );
        t.stock( s -> {
            s.symbol( "IBM" );
            s.market( "NYSE" );
        } );
    });
    o.sell( t -> {
        t.quantity( 50 );
        t.price( 375.00 );
        t.stock( s -> {
            s.symbol( "GOOGLE" );
            s.market( "NASDAQ" );
        } );
    });
} );
```
- 이런 DSL을 만들기 위해선 람다 표현을 받아 도메인 모델을 만드는 여러 빌더를 구현해야한다.
- 메서드 체인과 비슷하지만 customer객체를 빌더가 인수로 받음으로 DSL사용자가 람다로 인수를 구현할 수 있다.


- 함수 시퀀싱 DSL을 제공해주는 주문빌더 
```java
public class LambdaOrderBuilder {

    private Order order = new Order(); //빌더로 주문을 감쌈

    public static Order order(Consumer<LambdaOrderBuilder> consumer) {
        LambdaOrderBuilder builder = new LambdaOrderBuilder();
        consumer.accept(builder);//빌더로 전달된 람다표형를 실행
        return builder.order;//OrderBuilder의 Cunsumer 실행해 주분 반환
    }

    public void forCustomer(String customer) {
        order.setCustomer(customer); //주문 요청 고객 설정
    }

    public void buy(Consumer<TradeBuilder> consumer) {
        trade(consumer, Trade.Type.BUY); //매수주문을 만들도록 TradeBuilder소비
    }

    public void sell(Consumer<TradeBuilder> consumer) {
        trade(consumer, Trade.Type.SELL);//매도주문을 만들도록 TradeBuilder소비
    }

    private void trade(Consumer<TradeBuilder> consumer, Trade.Type type) {
        TradeBuilder builder = new TradeBuilder();
        builder.trade.setType(type);
        consumer.accept(builder);//TradeBuilder로 전달할 람다 실행
        order.addTrade(builder.trade);//TradeBuilder의 Cunsumer 실행해 거래를 주문에 추가
    }
}
```
- buy과 sell은 Consumer < TradeBuilder > 람다 표현식을 받는다. 
- 이 람다를 실행하면 아래 코드처럼 주식매수,매도 거래가 생성된다.
```java
public class TradeBuilder {
    private Trade trade = new Trade();

    public void quantity(int quantity) {
        trade.setQuantity( quantity );
    }

    public void price(double price) {
        trade.setPrice( price );
    }

    public void stock(Consumer<StockBuilder> consumer) {
        StockBuilder builder = new StockBuilder();
        consumer.accept(builder);
        trade.setStock(builder.stock);
    }
}
```
- TradeBuilder는 세번째 빌더의 Cunsumer, 거래된 주식을 받는다. 
```java
public class StockBuilder {
    private Stock stock = new Stock();

    public void symbol(String symbol) {
        stock.setSymbol( symbol );
    }

    public void market(String market) {
        stock.setMarket( market );
    }
}
```

- 이 방식은 이전 두가지 DSL의 장점을 더한다.
- 매서드 체인 패턴처럼 플루언트 방식으로 거래주문을 정의할 수 있고 
- 중첩함수처럼 다양한 람다 표형식 중첨과 비슷하게 도메인 객체 계층구조를 유지한다.
- 다만, 많은 코드 설정 및 람다표현식 잡음의 영향을 받는 단점이 존재한다.

### `3.4 조합하기`
- 앞서 살펴본 DSL 패턴은 각자 장단이 있다. 
- 한개의 DSL패턴만 사용할 필요는 없으며, 새로운 방식으로 개발도 가능하다.
```java
Order order =
        forCustomer( "BigBank", //최상위 주문 속성을 지정하는 중첩함수
                     buy( t -> t.quantity( 80 ) //주문을 만드는 람다표현
                                .stock( "IBM" ) //거래 객체를 만드는 메서드체인
                                .on( "NYSE" )
                                .at( 125.00 )),
                     sell( t -> t.quantity( 50 )
                                 .stock( "GOOGLE" )
                                 .on( "NASDAQ" )
                                 .at( 125.00 )) );
```

- 여러 형식을 혼합한 DSL을 제공하는 주문빌더 
```java
public class MixedBuilder {

    public static Order forCustomer(String customer,
                                    TradeBuilder... builders) {
        Order order = new Order();
        order.setCustomer(customer);
        Stream.of(builders).forEach(b -> order.addTrade(b.trade));
        return order;
    }

    public static TradeBuilder buy(Consumer<TradeBuilder> consumer) {
        return buildTrade(consumer, Trade.Type.BUY);
    }

    public static TradeBuilder sell(Consumer<TradeBuilder> consumer) {
        return buildTrade(consumer, Trade.Type.SELL);
    }

    private static TradeBuilder buildTrade(Consumer<TradeBuilder> consumer,
                                           Trade.Type buy) {
        TradeBuilder builder = new TradeBuilder();
        builder.trade.setType(buy);
        consumer.accept(builder);
        return builder;
    }
}
```
- 헬퍼클래스 TradeBuilder, StockBuilder\
```java
public class TradeBuilder {
    private Trade trade = new Trade();

    public TradeBuilder quantity(int quantity) {
        trade.setQuantity(quantity);
        return this;
    }

    public TradeBuilder at(double price) {
        trade.setPrice(price);
        return this;
    }

    public StockBuilder stock(String symbol) {
        return new StockBuilder(this, trade, symbol);
    }
}

public class StockBuilder {
    private final TradeBuilder builder;
    private final Trade trade;
    private final Stock stock = new Stock();

    private StockBuilder(TradeBuilder builder, Trade trade, String symbol){
        this.builder = builder;
        this.trade = trade;
        stock.setSymbol(symbol);
    }

    public TradeBuilder on(String market) {
        stock.setMarket(market);
        trade.setStock(stock);
        return builder;
    }
}
```
### `3.5 DSL에 메서드 참조 사용하기`
- 주문의 총 합에 세금을 추가해 최종 값을 계산하는 기능을 추가해보자

- 주문의 총 합게 적용할 세금 객체
```java
public class Tax {
    public static double regional(double value) {
        return value * 1.1;
    }

    public static double general(double value) {
        return value * 1.3;
    }

    public static double surcharge(double value) {
        return value * 1.05;
    }
}
```
- 불리언 플래그 집합을 이용해 주문에 세금 적용
```java
public static double calculate(Order order, boolean useRegional,
                               boolean useGeneral, boolean useSurcharge) {
    double value = order.getValue();
    if (useRegional) value = Tax.regional(value);
    if (useGeneral) value = Tax.general(value);
    if (useSurcharge) value = Tax.surcharge(value);
    return value;
}
```
- 이제 세금을 적용해보자
```java
double value = calculate(order, true, false, true);
```

- 불리언 변수의 순서를 기억하어렵고 어떤 세금이 적용됐는지 확인도 어렵다.
- DSL을 제공해보자
```java
public class TaxCalculator {
    private boolean useRegional;
    private boolean useGeneral;
    private boolean useSurcharge;

    public TaxCalculator withTaxRegional() {
        useRegional = true;
        return this;
    }

    public TaxCalculator withTaxGeneral() {
        useGeneral= true;
        return this;
    }

    public TaxCalculator withTaxSurcharge() {
        useSurcharge = true;
        return this;
    }

    public double calculate(Order order) {
        return calculate(order, useRegional, useGeneral, useSurcharge);
    }
}

//세금 적용
double value = new TaxCalculator().withTaxRegional()
                                  .withTaxSurcharge()
                                  .calculate(order);
```

- 하지만 코드가 여전히 장황하다. 리텍토링을 해보자
```java
public class TaxCalculator {
   public DoubleUnaryOperator taxFunction = d -> d;

    public TaxCalculator with(DoubleUnaryOperator f) {
        taxFunction = taxFunction.andThen(f);
        return this;
    }

    public double calculate(Order order) {
        return taxFunction.applyAsDouble(order.getValue());
    }
}

// 세금적용
double value = new TaxCalculator().with(Tax::regional)
                                  .with(Tax::surcharge)
                                  .calculate(order);
```


## 4. 실생활의 자바8 DSL
- DSL패턴별 장점과 단점  

| 패턴이름 | 장점| 단점 
| -------- | ------ | -------- |
| 메서드체인  | \- 메서드 이름이 키워드 인수 역할을 한다.<br>- 선택형파라미터와 잘 작동한다. <br>- 사용자가 정해진 순서대로 메서드 호출하도록 강제할 수 있다.<br>- 정적메서드를 최소화 하거나 없앨수있다.<br>- 문법적 잡을을 최소화한다. |- 구현이 장황하다 <br>- 빌드를 연결하는 접착 코드가 필요하다.<br>- 들여쓰기 규칙으로만 도메인 객체 계층을 정의한다.  |
| 메서드체인  |- 구현의 장황함을 줄일 수 있다.<br>- 함수 중첩으로 도메인 객체 계층을 반영한다.|- 정적메서드의 사용이 빈번하다.<br>- 이름이 아닌 위치로 인수를 정의한다.<br>- 선택형 파라미터를 처리할 메서드 오버로딩이 필요한다.|
| 람다를 이용한 함수 시퀀싱  |- 선택형 파라미터와 잘 작동한다.<br>- 정적메서드를 최소화하거나 없앨 수 있다.<br>-  람다 중첩으로 도메인 객체 계층을 반영한다.<br>- 빌더의 접착코드가 없다.|- 구현이 장황하다.<br>- 람다 표현식으로 인한 잡음이 존재한다.|

### `4.1 JOOQ`
- JOOQ는 SQL을 구현하는 내부적으로 DSL로 자바에 직접 내장된 형식안전언어이다.
```sql
SELECT * FROM BOOK
WHERE BOOK.PUBLISHED_IN = 2016
ORDER BY BOOK.TITLE
```
- 위 SQL 은 JOOQ DSL을 이용해 아래처럼 바꿀 수 있다.
```java
create.selectFrom(BOOK)
      .where(BOOK.PUBLISHED_IN.eq(2016))
      .orderBy(BOOK.TITLE)
```

- 스트림 API와 조합해 사용할수 있는 것이 JOOQ의 장점이다. 
- 이 기능 덕분에 SQL 질의로 나온 결과를 한개의 플루언트 구문으로 데이터를 메모리에서 조작이 가능하다.
```java
Class.forName("org.h2.Driver");
try (Connection c =
       getConnection("jdbc:h2:~/sql-goodies-with-mapping", "sa", "")) {
     //DB연결하기 
    DSL.using(c) // 만들어진 DB연결로 JOOQ SQL 시작
       .select(BOOK.AUTHOR, BOOK.TITLE)
       .where(BOOK.PUBLISHED_IN.eq(2016))
  .orderBy(BOOK.TITLE)
  .fetch() // JOOQ로 SQL정의
  .stream() // DB에서 데이터 가져오기 JOOQ 구문은 여기서 종료
  .collect(groupingBy( //stream API로 처리 시작 
       r -> r.getValue(BOOK.AUTHOR),
       LinkedHashMap::new,
       mapping(r -> r.getValue(BOOK.TITLE), toList())))
       .forEach((author, titles) ->
    System.out.println(author + " is author of " + titles));
}
```

### `4.2 Cucumber`
- 큐컴버는 BDD 도구로 도메인전용 스트립트 언어를 사용한 명령어를 TC로 변환한다.
- 개발자가 비지니스 시나리오를 평문 영어로 구현할수 있는 도구이다. 
- 다음은 큐컴버 스크립팅언어를 사용한 비지니스 시나리오 정의 예제이다.
```
Feature: Buy stock
  Scenario: Buy 10 IBM stocks
    Given the price of a "IBM" stock is 125$
    When I buy 10 "IBM"
    Then the order value should be 1250$
```
- 큐컴버는 Given(전제조건정의), When(객체의 실질 호출), Then(결과확인  assertion)세가지로 구분된다.
- 테스트 시나리오를 정의하는 스크립트는 제한된 갯수의 키워드를 제공하며, 자유롭게 문장을 구현할수 있는 외부DSL을 사용한다.
- 이들 문장은 테스크 테이스의 변수를 캡쳐라는 정규표현으로 매칭되어 테스트를 구현하는 메서드로 전달한다.
- 위 큐컴버 DSL 을 통해 생긴 TC 개발
``` java
public class BuyStocksSteps {
    private Map<String, Integer> stockUnitPrices = new HashMap<>();
    private Order order = new Order();

    @Given("^the price of a \"(.*?)\" stock is (\\d+)\\$$") //전제조건 주식 단가 저장
    public void setUnitPrice(String stockName, int unitPrice) {
        stockUnitValues.put(stockName, unitPrice); //주식 단가 저장
    }

    @When("^I buy (\\d+) \"(.*?)\"$") // 테스드 대상 도메인 모델에 행할 액션 정의
    public void buyStocks(int quantity, String stockName) {
        Trade trade = new Trade(); // 적절하게 도메인 모델 호출
        trade.setType(Trade.Type.BUY);

        Stock stock = new Stock();
        stock.setSymbol(stockName);

        trade.setStock(stock);
        trade.setPrice(stockUnitPrices.get(stockName));
        trade.setQuantity(quantity);
        order.addTrade(trade);
    }

    @Then("^the order value should be (\\d+)\\$$") 
    public void checkOrderValue(int expectedValue) { //결과 정의
        assertEquals(expectedValue, order.getValue()); //결과 확인
    }
}
```

- 자바 8이 람다 표현식을 지원하므로 두개의 인수 매서드를 이용해 어노테이션을 제거하도록 큐컴버 개발도 가능하다.
``` java
public class BuyStocksSteps implements cucumber.api.java8.En {
    private Map<String, Integer> stockUnitPrices = new HashMap<>();
    private Order order = new Order();
    public BuyStocksSteps() {
        Given("^the price of a \"(.*?)\" stock is (\\d+)\\$$",
              (String stockName, int unitPrice) -> {
                  stockUnitValues.put(stockName, unitPrice);
        });
        // ... When and Then lambdas omitted for brevity
    }
}
```
- 코드는 더 단순해지며 테스트메서드가 무명람다로 바뀌면서 메서드 이름에 대한 부담이 줄어든다. 

### `4.3 스프링 통합`
- 스프링통합(Spring Integration)은 엔터프라이즈 통합 패턴을 지원하도록 의존성 주입에 기반한 스프링 프로그래밍 모델을 확장한다.
- 복잡한 엔터프라이즈를 구현하는 단순한 모델의 제공과 비동기, 메세지 주도 아키텍쳐를 쉽게 적용할수 있도록 한다.

- 엔드포인트, 폴러, 채널 인터셉터등 메세지 기반에 어플리케이션에 필요한 공통 패선을 구현한다.
- 가독성이 높아지도록 DSL에서 동사로 구현하며 여러 앤드포인트를 한개 이상의 메세지흐름으로 조합해 통합한다.
``` java
@Configuration
@EnableIntegration
public class MyConfiguration {

    @Bean
    public MessageSource<?> integerMessageSource() {
        MethodInvokingMessageSource source =
                new MethodInvokingMessageSource();
        // 호출시 AtomicInteger를 증가시키는 MessageSource 생성
        source.setObject(new AtomicInteger());
        source.setMethodName("getAndIncrement");
        return source;
    }

    @Bean
    public DirectChannel inputChannel() {
        return new DirectChannel();
        //MessageSource에서 도착하는 데이터를 나르는 채널
    }

    @Bean
    public IntegrationFlow myFlow() {
        return IntegrationFlows
                   .from(this.integerMessageSource(), 
                   // 기존에 정의한 MessageSource를 Integeration Flow입력으로 사용
                         c -> c.poller(Pollers.fixedRate(10)))
                         // MessageSource를 폴링하며 데이터를 가져옴
                   .channel(this.inputChannel())
                   .filter((Integer p) -> p % 2 == 0) // 짝수 거르기;
                   .transform(Object::toString) // 문자열로 변환
                   .channel(MessageChannels.queue("queueChannel"))
                   .get();
    }
}
```
- myFlow는 Integeration Flow를 만든다. 
- 예제는 메서드 체인 플로우를 구현하는 Integeration Flow클래스가 제공하는 빌더를 사용하낟.
- 결과 플로는 고정된 속도로 를 폴링하며 정수를 제공하고 짝수만 거른뒤 문자열로 변환해 출력채넗에 전달하낟. 
- inputChannel 이름만 알고 있으면 이 API를 이용해서 프롤내의 모든 컴포넌트로 메세지 전달이 가능하다.
``` java
@Bean
public IntegrationFlow myFlow() {
    return flow -> flow.filter((Integer p) -> p % 2 == 0)
                       .transform(Object::toString)
                       .handle(System.out::println);
}
```