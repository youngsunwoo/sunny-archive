# 6강
 by gwegwe1234

[[toc]]

## 0. Overview

- collect와 컬렉터로 구현할 수 있는 질의 예제
    - 통화별로 트랜잭션을 그룹화한 다음에 해당 통화로 일어난 모든 트랜잭션 합계를 계산하시오(Map<Currency, Integer> 반환)
    - 트랜잭션을 비싼 트랜잭션과 저렴한 트랜잭션 두 그릅으로 분류하시오 (Map<Boolean, List<Transaction>> 반환)
    - 트랜잭션을 도시 등 다수준으로 그룹화하시오. 그리고 각 트랜잭션이 비싼지 저렴한지 구분하시오 (Map<String, Map<Boolean, List<Transaction>>> 반환)
- 람다가 아닌 일반 자바 소스로 짤 경우는 다음과 같다.

```java
Map<Currency, List<Transaction>> transactionsByCurrencies =
                                                  new HashMap<>();
for (Transaction transaction : transactions) {
    Currency currency = transaction.getCurrency();
    List<Transaction> transactionsForCurrency =
                                    transactionsByCurrencies.get(currency);
    if (transactionsForCurrency == null) {
        transactionsForCurrency = new ArrayList<>();
        transactionsByCurrencies
                            .put(currency, transactionsForCurrency);
    }
    transactionsForCurrency.add(transaction);
}
```

- 별 내용없는 소스가 길어서 보기가 싫다.
- Stream에 toList 하는거 말고도 범용적인 컬렉터 파라미터를 collect 메소드에 넘겨서 원하는 연산을 좀더 간결하게 가능하다.

```java
Map<Currency, List<Transaction>> transactionsByCurrencies = 
    transactions.stream().collect(groupingBy(Transaction::getCurrency));
```

- So Simple!

## 1. 컬렉터란 무엇인가?
- 함수형 프로그래밍은 '무엇'을 원하는지 직접 명시하는 형태여서 어떤 방법으로 이를 얻는지는 관심이 없다.
- 이전 장들 예제에서 toList를 통해 리스트를 만들라고 collect로 넘겨줬는데, 비슷하게 groupingBy도 특정 키에 대응하는 요소로 맵을 만들라는 기능을 해준다.
- 다수준으로 그룹화를 할 때 특히 함수형 프로그래밍의 장점이 드러난다.

### 1-1. 고급 리듀싱 기능을 수행하는 컬렉터
- 함수형 프로그래밍 API의 장점으로는, 높은 수준의 조합성과 재사용 성에 있다.
- collect같은 경우, 스트림에서 호출하면 스트림의 요소에 (컬렉터로 파라미터화된) 리듀싱 연산이 수행된다.

![mj](../../images/book/mj_6_1.jpg)

- 위의 그림은 내부적으로 리듀싱 연산이 일어나는걸 보여줌.
- 위의 명령어 프로그래밍에서 만들어놓은 함수들을 쓰면, 우리가 맨날 구현하던 귀찮은 작업들이 자동으로 수행되는 장점이 있다.

### 1-2. 미리 정의된 컬렉터
- Collectors에서 제공하는 메서드의 기능은 크게 세 가지로 구분된다.

```java
1. 스트림 요소를 하나의 값으로 리듀스하고 요약
2. 요소 그룹화
3. 요소 분할
```

## 2. 리듀싱과 요약
- 이전에 사용한 메뉴 예제를 사용한다.
- counting 예제

```java
long howManyDishes = Dinner.menu.stream().collect(Collectors.counting());

long howManyDishes2 = Dinner.menu.stream().count();
```

### 2-1. 스트림값에서 최댓값과 최솟값 검색
- Collectors.maxBy, Collectors.minBy 두 개의 메소드를 이용해 스트림의 최댓값과 최솟값을 계산할 수 있다.
- 두 컬렉터는 Comparator를 인수로 받는다.

```java
Comparator<Dish> dishCalories =
    Comparator.comparingInt(Dish::getCalories);

Optional<Dish> mostCalorieDish =
    Dinner.menu.stream().collect(Collectors.maxBy(dishCalories));
```

### 2-2. 요약 연산
- summingInt는 객체를 int로 매핑하는 함수를 인수로 받는다.
- summingInt의 인수로 전달된 함수는 객체를 int로 매핑한 컬렉터를 반환한다.
- 그리고 summingInt가 collect 메소드로 전달되면 요약 작업을 수행한다.

```java
int totalCalories = Dinner.menu.stream().collect(Collectors.summingInt(Dish::getCalories));
```

![mj](../../images/book/mj_6_2.jpg)

- 위 그림처럼 리듀싱 작업이 숨어있는듯 하다
- 평균값 계산같은 연산도 요약이 가능하다

```java
double avgCalories =
    Dinner.menu.stream().collect(Collectors.averagingInt(Dish::getCalories));
```

### 2-3. 문자열 연결
- joining 팩토리 메소드를 이용하면 스트림의 각 객체에 toString 메소드를 호출해서 추출한 모든 문자열을 하나의 문자열로 연결해서 반환한다.

```java
String shortMenu = Dinner.menu.stream().map(Dish::getName).collect(Collectors.joining());

porkbeefchickenfrench friesriceseason fruitpizzaprawnssalmon
```

- joining 메소드는 내부적으로 StringBuilder를 이용해서 문자열을 하나로 만든다.
- Dish 클래스가 요리명을 반환하는 toString 메소드를 포함하면, map으로 각 요리의 이름을 추출하는 과정 생략이 가능하다.

```java
String shortMenu2 = Dinner.menu.stream().collect(Collectors.joining());
```

- 결과가 알아보기 거지같으니까 구분하도록 구분자를 받을 수 있게 오버로딩된 joining 메소드도 있다.

```java
String shortMenuByComma = Dinner.menu.stream().map(Dish::getName).collect(Collectors.joining(", "));

pork, beef, chicken, french fries, rice, season fruit, pizza, prawns, salmon
```

### 2-4. 범용 리듀싱 요약 연산
- 위에서 해본건 다 reducing 팩토리 메소드로 구현이 가능하다.
- Collectors.reducing
- 당연히 기존 구현된거 쓰는게 편하니까 구현된게 있으면 구현된걸 쓰자

```java
int totalCaloriesByReducing = Dinner.menu.stream()
        .collect(Collectors.reducing(0, Dish::getCalories, (i, j) -> i + j));
```

- 칼로리 총합을 구하는 로직을 리듀싱으로 구현하는 로직이다.
- reducing은 세 개의 인자를 받는다.

```java
1. 첫 번째 인수는 리듀싱 연산의 시작값이거나 스트림에 인수가 없을 때는 반환값이다. (숫자 합계에서는 인수가 없을 때 반환값으로 0이 적합하다)

2. 두 번째 인수는 요리를 칼로리 정수로 변환할 때 사용한 변환 함수이다. 

3. 세 번째 인수는 같은 종류의 두 항목을 하나의 값으로 더하는 BinaryOperator다. 예제에서는 두 개의 int가 사용되었다.
```

- 한 개의 인수를 가진 reducing을 사용해서 칼로리가 가장 높은 요리를 찾는 방법도 있다.

```java
Optional<Dish> mostCalorieDishByReducing =
    Dinner.menu.stream().collect(Collectors.reducing(
        (d1, d2) -> d1.getCalories() > d2.getCalories() ? d1 : d2));
```

- 한개의 인수를 받는 리듀싱 팩토리 메소드는, 세 개의 인수를 갖는 reducing 메소드에서 스트림의 첫 번째 요소를 시작요소로 받고, 자신을 그대로 반환하는 항등 함수를 두 번째 인수로 받는 상황에 해당된다.
- 반환은 null이 나올 수 있으므로 Optional<T> 객체로 받는다.

#### 컬렉션 프레임워크 유연성 : 같은 연산도 다양한 방식으로 수행할 수 있다.

- 컬렉터의 reducing을 이용하면 이전에 람다로 해결하던 부분을 좀더 쉽게 고칠 수도 있다.

```java
int totalCaloriesByReducingCollectors = 
        Dinner.menu.stream().collect(Collectors.reducing(0, Dish::getCalories, Integer::sum));
```

![mj](../../images/book/mj_6_3.jpg)

## 3. 그룹화
- Collectors.groupingBy를 이용해 그루핑을 할 수 있다.

```java
Map<Dish.Type, List<Dish>> dishesByType =
    Dinner.menu.stream().collect(Collectors.groupingBy(Dish::getType));

{FISH=[prawns, salmon], MEAT=[pork, beef, chicken], OTHER=[french fries, rice, season fruit, pizza]}
```

- 스트림의 각 요리에서 Dish.Type과 일치하는 모든 요리를 추출하는 함수를 groupingBy 메소드로 전달한다.
- 이 함수를 기준으로 스트림이 그룹화되므로 이를 분류 함수라고 부른다.

![mj](../../images/book/mj_6_4.jpg)

- 좀더 복잡한 분류 기준이 필요한 경우에는 메소드 참조를 사용해서는 분류가 불가능하고, 람다로 직접 로직을 작성해 주어야 한다.
- 예를 들어 400칼로리 이하는 'diet', 400~700은 'normal' 700 초과는 'fat' 으로 분류하고자 하면, Dish 클래스 내부엔 해당 로직이 없으므로 새로 로직을 람다로 작성해 준다.

```java
Map<CaloricLevel, List<Dish>> dishesByCaloricLevel =
        Dinner.menu.stream().collect(Collectors.groupingBy(dish -> {
            if (dish.getCalories() < 400) return CaloricLevel.DIET;
            else if (dish.getCalories() < 700) return CaloricLevel.NORMAL;
            else return CaloricLevel.FAT;
        }));

{NORMAL=[chicken, french fries, pizza, salmon], DIET=[rice, season fruit, prawns], FAT=[pork, beef]}
```

### 3-1. 그룹화된 요소 조작
- 500칼로리가 넘는 요리만 필터링한다고 했을 때, 필터를 쓰면 다음과 같다.

```java
Map<Dish.Type, List<Dish>> caloricDishesByType =
        Dinner.menu.stream().filter(dish -> dish.getCalories() > 500)
          .collect(Collectors.groupingBy(Dish::getType));
```

- 문제는 결과가

```
{MEAT=[pork, beef], OTHER=[french fries, pizza]}
```

- 500칼로리가 넘는항목이 없는 FISH 타입이 아예 항목에서 사라져 버린다.
- 이런 경우, filtering 메소드는 프레디케이트를 인수로 받는 groupingBy의 파라미터로 넣어준다. (자바 9)

```java
Map<Dish.Type, List<Dish>> caloricDishesByFiltering =
        Dinner.menu.stream().collect(
            Collectors.groupingBy(Dish::getType, Collectors.filtering(
                dish -> dish.getCalories > 500, Collectors.toList()));
```

- 그룹화된 항목을 조작하는 다른 유용한 기능은 매핑 함수를 이용해 요소를 변환하는 작업이 있다.
- filtering대신 mapping을 넣어주면 된다.

```java
Map<Dish.Type, List<String>> dishNamesByType =
      menu.stream()
          .collect(groupingBy(Dish::getType,
                   mapping(Dish::getName, toList())));
```

- groupingBy에 세번째 인자 컬렉터를 넣어서 일반 맵이 아닌 flatMap 변환을 수행할 수 있다.

```java
Map<String, List<String>> dishTags = new HashMap<>();
    dishTags.put("pork", asList("greasy", "salty"));
    dishTags.put("beef", asList("salty", "roasted"));
    dishTags.put("chicken", asList("fried", "crisp"));
    dishTags.put("french fries", asList("greasy", "fried"));
    dishTags.put("rice", asList("light", "natural"));
    dishTags.put("season fruit", asList("fresh", "natural"));
    dishTags.put("pizza", asList("tasty", "salty"));
    dishTags.put("prawns", asList("tasty", "roasted"));
    dishTags.put("salmon", asList("delicious", "fresh"));
```

```java
Map<Dish.Type, Set<String>> dishNamesByType =
   menu.stream()
      .collect(groupingBy(Dish::getType,
               flatMapping(dish -> dishTags.get( dish.getName() ).stream(),
                           toSet())));

{MEAT=[salty, greasy, roasted, fried, crisp], FISH=[roasted, tasty, fresh,
     delicious], OTHER=[salty, greasy, natural, light, tasty, fresh, fried]}
```

### 3-2. 다수준 그룹화
- 이중 그룹핑(..)을 쓰면된다.

```java
Map<Dish.Type, Map<CaloricLevel, List<Dish>>> dishesByTypeCaloricLevel =
        Dinner.menu.stream().collect(
            Collectors.groupingBy(Dish::getType,
                Collectors.groupingBy(dish -> {
                  if(dish.getCalories() < 400) return CaloricLevel.DIET;
                  else if(dish.getCalories() < 700) return CaloricLevel.NORMAL;
                  else return CaloricLevel.FAT;
                }))
        );

{FISH={NORMAL=[salmon], DIET=[prawns]}, MEAT={NORMAL=[chicken], FAT=[pork, beef]}, 
OTHER={NORMAL=[french fries, pizza], DIET=[rice, season fruit]}}
```

- 이렇게 이중으로 그룹핑이 된다.

![mj](../../images/book/mj_6_5.jpg)

### 3-3. 서브그룹으로 데이터 수집
- 첫 번째 groupingBy로 넘겨주는 컬렉터의 형식은 제한이 없다.

```java
Map<Dish.Type, Long> typesCount =
        Dinner.menu.stream().collect(Collectors.groupingBy(Dish::getType, Collectors.counting()));

{FISH=2, MEAT=3, OTHER=4}
```

- 한 개의 인수를 갖는 groupingBy(f)는 groupingBy(f, toList())의 축약형이다.
- 가장 높은 칼로리를 갖는 코드도 아래와 같이 구현이 가능하다.

```java
Map<Dish.Type, Optional<Dish>> mostCaloricByType =
        Dinner.menu.stream().collect(Collectors.groupingBy(Dish::getType,
            Collectors.maxBy(Comparator.comparingInt(Dish::getCalories))));

{FISH=Optional[salmon], MEAT=Optional[pork], OTHER=Optional[pizza]}
```

:::tip
처음부터 존재하지 않는 요리의 키는 맵에 추가되지 않기 때문에, Optional.empty()값을 같는 요리는 없다. groupingBy 컬렉터는 스트림의 첫 번째 요소를 찾은 이후에 그룹화 맵에 새로운 키를 게으르게 추가하므로, 굳이 Optional 래퍼를 사용할 필요가 없다.
:::

#### 컬렉터 결과를 다른 형식에 적용하기
- Collectors.collectingAndThen으로 컬렉터가 반환한 결과를 다른 형식으로 활용할 수 있다.

```java
Map<Dish.Type, Dish> mostCaloricByTypeAndthen =
        Dinner.menu.stream().collect(
            Collectors.groupingBy(Dish::getType, Collectors.collectingAndThen(
                Collectors.maxBy(Comparator.comparingInt(Dish::getCalories)),
                Optional::get
            ))
        );

{FISH=salmon, MEAT=pork, OTHER=pizza}
```

- collectingAndThen은 적용할 컬렉터와 변환 함수를 인수로 받는다.
- 위의 예제에선 Optional.get()으로 Optional 객체 안의 값으로 변환한다.

![mj](../../images/book/mj_6_6.jpg)

#### groupingBy와 함께 사용하는 다른 컬렉터 예제
- 일반적으로 스트림에서 같은 그룹으로 분류된 모든 요소에 리듀싱 작업을 수행할 때는 팩토리 메소드 groupingBy에 두 번째 인수로 전달한 컬렉터를 사용한다.
- 예를 들어 메뉴에 있는 모든 요리의 칼로리 합계를 구하려고 만든 컬렉터를 재사용 할 수 있다.

```java
Map<Dish.Type, Integer> totalCaloriesByType =
        Dinner.menu.stream()
            .collect(Collectors.groupingBy(Dish::getType, Collectors.summingInt(Dish::getCalories)));
```

- mapping도 자주 사용된다.
- mapping 메소드는 스트림의 인수를 변환하는 변환 함수의 결과 객체를 누적하는 컬렉터를 인수로 받는다.
- 예를 들어 각 요리 형식에 존재하는 모든 CaloricLevel값을 알고 싶다고 가정한다.

```java
Map<Dish.Type, Set<CaloricLevel>> caloricLevelsByType =
        Dinner.menu.stream().collect(Collectors.groupingBy(Dish::getType, Collectors.mapping(dish -> {
          if (dish.getCalories() < 400) return CaloricLevel.DIET;
          else if (dish.getCalories() < 700) return CaloricLevel.NORMAL;
          else return CaloricLevel.FAT;
        }, Collectors.toSet())));

{FISH=[NORMAL, DIET], MEAT=[NORMAL, FAT], OTHER=[NORMAL, DIET]}
```

- mapping 메소드에 전달한 변환 함수는 Dish를 CaloricLevel로 매핑한다.

## 4. 분할
- 분할 함수라 불리는 프레디케이트를 분류 함수로 사용하는 특수한 그룹화 기능이다.
- 분할 함수는 불리언을 반환하므로 맵의 키 형식은 불리언이다.
- 채식과 아닌 요리를 구분해 보자

```java
Map<Boolean, List<Dish>> partitionedMenu =
        Dinner.menu.stream().collect(Collectors.partitioningBy(Dish::isVegetarian));

{false=[pork, beef, chicken, prawns, salmon], true=[french fries, rice, season fruit, pizza]}
```

- 이제 참값의 키로 채식요리를 얻을 수 있다.

```java
List<Dish> vegetarianDishes = partitionedMenu.get(true);
```

### 4-1. 분할의 장점
- 분할 함수가 반환하는 참, 거짓 두 가지 요소의 스트림 리스트를 모두 유지하다는 것이 분할의 장점이다.
- 채식인 메뉴, 아닌메뉴 둘다 얻을 수 있다.
- 컬렉터를 두 번째 파라미터로 넘겨주는 partitioningBy도 있다.

```java
Map<Boolean, Map<Dish.Type, List<Dish>>> vegetarianDishesByType =
        Dinner.menu.stream().collect(
            Collectors.partitioningBy(Dish::isVegetarian, Collectors.groupingBy(Dish::getType))
        );

{false={FISH=[prawns, salmon], MEAT=[pork, beef, chicken]}, true={OTHER=[french fries, rice, season fruit, pizza]}}
```

### 4-2. 숫자를 소수와 비소수로 분할하기
- 정수 n을 받아서 2에서 n까지의 자연수를 소수와 비소수로 나누는 프로그램을 구현한다.
- 먼저 주어진 수가 소수인지 아닌지 판단하는 프레디케이트를 구현한다.

```java
public boolean isPrime(int candidate) {
    return IntStream.range(2, candidate).noneMatch(i -> candidate % i == 0);
}
```

- 여기에 n개의 숫자를 포함하는 스트림을 만든 다음에 우리가 구현한 isPrime 메소드를 프레디케이트로 이용하고 partitioningBy 컬렉터로 리듀스해서 숫자를 소수와 비소수로 분류할 수 있다.

```java
Map<Boolean, List<Integer>> partitionPrimes =
        IntStream.rangeClosed(2, 100).boxed().collect(Collectors.partitioningBy(candidate -> isPrime(candidate)));
```

## 5. Collector 인터페이스
- Collector Interface

```java
public interface Collector<T, A, R> {
    Supplier<A> supplier();
    BiConsumer<A, T> accumulator();
    Function<A, R> finisher();
    BinaryOperator<A> combiner();
    Set<Characteristics> characteristics();
}
```

```java
T는 수집될 스트림 항목의 제네릭 형식이다.

A는 누적자, 즉 수집 과정에서 중간 결과를 누적하는 객체의 형식

R은 수집 연산 결과 객체의 형식(대게 컬랙션)
```

- 예를 들어 Stream<T>의 모든 요소를 List<T>로 수집하는 ToListCollector라는 클래스 구현이 가능하다.

```java
public class ToListCollector<T> implements Collector<T, List<T>, List<T>>
```

### 5-1. Collector 인터페이스의 메소드 살펴보기

#### supplier 메소드: 새로운 결과 컨테이너 만들기
- supplier는 수집 과정에서 빈 누적자 인스턴스를 만드는 파라미터가 없는 함수다.
- ToListCollector에서 supplier는 다음처럼 빈 리스트를 반환한다.

```java
public Supplier<List<T>> supplier() {
    return () -> new ArrayList<T>();
}
```

#### accumulator 메소드: 결과 컨테이너에 요소 추가하기
- accumulator 메소드는 리듀싱 연산을 수행하는 함수를 반환한다.
- 스트림에서 n번째 요소를 탐색할 때 두 인스, 즉 누적자(스트림의 첫 n-1개 항목을 수집한 상태)와 n번째 요소를 함수에 적용한다.
- 함수의 반환값은 void이고, 요소를 탐색하면서 적용하는 함수에 의해 누적자 내부상태가 바뀌므로 누적자가 어떤 값일지 단정할 수 없다.

```java
public BiConsumer<List<T>, T> accumulator() {
    return (list, item) -> list.add(item);
}
```

#### finisher 메소드: 최종 변환값을 결과 컨테이너로 적용하기
- finisher 메소드는 스트림 탐색을 끝내고 누적자 객체를 최종 결과로 변환하면서 누적 과정을 끝낼 때 호출할 함수를 반환해야 한다.
- 현재 ToListCollector는 List<T> 형태로, 이미 누적자 객체가 최종 결과와 같은 객체이다.
- 이럴 땐, 따로 변환 과정이 필요가 없으므로 항등 함수를 반환한다.

```java
public Function<List<T>, List<T>> finisher() {
    return Function.identity();
}
```

- 위의 세 가지 메소드로도 순차적 스트림 리듀싱 기능을 수행할 수 있다.
- 실제로 collect안에서 동작할 때, 병렬 처리, 레이지 로딩같은 걸 고려해야 되므로 스트림 리듀싱 기능 구현은 복잡하다.

![mj](../../images/book/mj_6_7.jpg)

#### combiner 메소드: 두 결과 컨테이너 병합
- 마지막으로 리듀싱 연산에서 사용할 함수를 반환하는 네 번째 메소드 combiner를 살펴본다.
- combiner는 스트림의 서로 다른 서브파트를 병렬로 처리할 때 누적자가 이 결과를 어떻게 처리할지 정의한다.
- toList의 combiner는 비교적 쉽게 구현할 수 있다.
- 즉 스트림의 두 번째 서브파트에서 수집한 항목 리스트를 첫 번째 서브파트 결과 리스트의 뒤에 추가하면 된다.

```java
public BinaryOperator<List<T>> combiner() {
    return (list1, list2) -> {
      list1.addAll(list2);
      return list1;
    };
}
```

![mj](../../images/book/mj_6_8.jpg)

- 네 번째 메소드를 이용하면 스트림의 리듀싱을 병렬로 수행할 수 있다.
- 스트림의 리듀싱을 병렬로 수행할 때 자바 7의 포크/조인 프레임워크와 Spliterator를 사용한다.

```java
1. 스트림을 분할해야 하는지 정의하는 조건이 거짓으로 바뀌기 전까지 원래 스트림을 재귀적으로
분할한다. (보통 분산된 작업의 크기가 너무 작아지면 병렬 수행의 속도는 순차 수행의 속도보다 느려진다.
즉 병렬 수행의 효과가 상쇄된다. 일반적으로 프로세싱 코어의 개수를 초과하는 병렬 작업은 효율적이지 않다)

2. 위의 그림처럼 모든 서브스트림의 각 요소에 리듀싱 연산을 순차적으로 적용해서 서브스트림을 병렬로 처리할 수 있다.

3. 마지막에는 컬렉터의 combiner 메소드가 반환하는 함수로 모든 부분결과를 쌍으로 합친다. 즉 분할된 모든
서브스트림의 결과를 합치면서 연산이 완료된다.
```

#### Characteristics 메소드
- 컬렉터의 연산을 정의하는 Characteristics 형식의 불변 집합을 반환한다.
- Characteristics는 스트림을 병렬로 리듀스할 것인지 그리고 병렬로 리듀스한다면 어떤 최적화를 선택해야 할지 힌트를 제공한다.
- Characteristics는 다음 세 항목을 포함하는 열거형이다.

```java
1. UNORDERED : 리듀싱 결과는 스트림 요소의 방문 순서나 누적 순서에 영향을 받지 않는다.

2. CONCURRENT : 다중 스레드에서 accumulator 함수를 동시에 호출할 수 있으며 이 컬렉터는 스트림의 
병렬 리듀싱을 수행할 수 있다. 컬렉터의 플래그에 UNORDERED를 함께 설정하지 않았다면(집합처럼 순서가 없는) 데이터 소스가 정렬되어
있지 않은 상황에서만 병렬 리듀싱을 수행할 수 있다.

3. IDENTITY_FINISH : finisher 메소드가 반환하는 함수는 단순히 identity를 적용할 뿐이므로 이를 생략
할 수 있다. 따라서 리듀싱 과정의 최종 결과로 누적자 객체를 바로 사용할 수 있다. 또한 누적자 A를 결과 R로 안전
하게 형변환 할 수 있다.
```

- 위의 ToListCollector는 누적하는 데 사용한 리스트가 최종결과 형식이므로, 추가 변환이 필요없어서 IDENTITY_FINISH다.
- 순서는 상관 없으므로 UNORDERED 이다.

```java
public Set<Characteristics> characteristics() {
    return Collections.unmodifiableSet(EnumSet.of(
        Characteristics.IDENTITY_FINISH, Characteristics.CONCURRENT));
  }
```

### 5-2. 응용하기

- 전체 소스는 다음과 같다.

```java
package chap6;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collector;

public class ToListCollector<T> implements Collector<T, List<T>, List<T>> {

  @Override
  public Supplier<List<T>> supplier() {
    return ArrayList::new;
  }

  @Override
  public BiConsumer<List<T>, T> accumulator() {
    return (list, item) -> list.add(item);
  }

  @Override
  public BinaryOperator<List<T>> combiner() {
    return (list1, list2) -> {
      list1.addAll(list2);
      return list1;
    };
  }

  @Override
  public Function<List<T>, List<T>> finisher() {
    return Function.identity();
  }

  @Override
  public Set<Characteristics> characteristics() {
    return Collections.unmodifiableSet(EnumSet.of(Characteristics.IDENTITY_FINISH, Characteristics.CONCURRENT));
  }
}
```

- 위의 소스는 사소한 최적화를 제외하면 toList()와 거의 동일하다.

```java
List<Dish> dishes = Dinner.menu.stream().collect(new ToListCollector<Dish>());
```

#### 컬렉터 구현을 만들지 않고도 커스텀 수집 수행하기
- IDENTITY_FINISH 수집 연산에서는 Collector 인터페이스를 완전히 새로 구현하지 않고도 같은 결과를 얻을 수 있다.
- Stream은 세 함수(발행, 누적, 합침)를 인수로 받는 collect 메소드를 오버로드하며 각각의 메소드는 Collector 인터페이스의 메소드가 반환하는 함수와 같은 기능을 수행한다.

```java
<R> R collect(Supplier<R> supplier,
                  BiConsumer<R, ? super T> accumulator,
                  BiConsumer<R, R> combiner); // 요런 형태로 되어있음
```

```java
List<Dish> dishes2 = Dinner.menu.stream().collect(
        ArrayList::new, // 발행
        List::add,  // 누적
        List::addAll); // 합침
```

- 위에건 편하지만, 가독성이 후지고 Characteristics 같은걸 전달할 수 없다.

## 6. 커스텀 컬렉터를 구현해서 성능 개선하기
- 아래의 코드처럼 커스텀 컬렉터로 n까지의 자연수를 소수와 비소수로 분할할 수 있다.

```java
public Map<Boolean, List<Integer>> partitionPrimes(int n) {
return IntStream.rangeClosed(2, n).boxed()
                .collect(partitioningBy(candidate -> isPrime(candidate));
}
```

- 소수 찾기는 제곱근 이하의 대상의 숫자 범위로 제한한다.

```java
public boolean isPrime(int candidate) {
    int candidateRoot = (int) Math.sqrt((double) candidate);
    return IntStream.rangeClosed(2, candidateRoot)
                    .noneMatch(i -> candidate % i == 0);
}
```

- 애낼 성능 개선해 보자

### 6-1. 소수로만 나누기
- 나누는 수를 소수로 나누면 케이스가 좀더 줄어든다.
- 지금까지 찾은 소수 리스트에 접근할 수 있어야 된다.
- 컬렉터로는 컬렉터 수집 과정에서 부분 결과에 접근할 수 없는데, 커스텀 컬렉터 클래스로 문제를 해결할 수 있다.
- 중간 결과 리스트가 있다면 isPrime 메소드로 중간 결과 리스트를 전달하도록 구현해 준다.

```java
public static boolean isPrime(List<Integer> primes, int candidate) {
    int candidateRoot = (int) Math.sqrt((double) candidate);
    return takeWhile(primes, i -> i <= candidateRoot)
        .stream()
        .noneMatch(p -> candidate % p == 0);
}

public static <A> List<A> takeWhile(List<A> list, Predicate<A> p) {
    int i = 0;
    for (A item : list) {
      if (!p.test(item)) {
        if(!p.test(item)) {
          return list.subList(0, i);
        }
        i++;
      }
    }
    return list;
}
```

#### 1단계 : Collector 클래스 시그니처 정의
- 다음의 Collector 인터페이스 정의를 참고해서 클래스 시그니처를 만들자.

```java
public interface Collector<T, A, R> {
  Supplier<A> supplier();
  BiConsumer<A, T> accumulator();
  BinaryOperator<A> combiner();
  Function<A, R> finisher();
  Set<Characteristics> characteristics();
}
``

- T는 스트림 요소의 형식, A는 중간 결과를 누적하는 객체의 형식, R은 collect 연산의 최종 결과 형식
- 정수로 이루어진 스트림에서 누적자와 최종 결과의 형식이 Map<Boolean, List<Integer>>인 컬렉터를 구현한다.
- 참과 거짓을 키로 소수와 소수가 아닌 수로 값으로 갖는다.

```java
public class PrimeNumbersCollector implements Collector<Integer,
                                                Map<Boolean, List<Integer>>,
                                                Map<Boolean, List<Integer>>>
```

#### 2단계 : 리듀싱 연산 구현
- Collector 인터페이스에 선언된 다섯 메소드를 구현한다.

```java
public Supplier<Map<Boolean, List<Integer>>> supplier() {
    return () -> new HashMap<Boolean, List<Integer>>() {{
     put(true, new ArrayList<>());
     put(false, new ArrayList<>());
    }};
}
```

- 누적자로 사용할 맵을 만들면서 true, false 키와 빈 리스트로 초기화를 했다.
- 수집 과정에서 빈 리스트에 각각 소수와 비소수를 추가해 준다.
- 스트림의 요소를 어떻게 수집할 지 결정하는 것은 accumulator 메소드 이므로 구현하는 컬렉터에서 가장 중요한 메소드이다.

```java
public BiConsumer<Map<Boolean, List<Integer>>, Integer> accumulator() {
    return (Map<Boolean, List<Integer>> acc, Integer candidate) -> {
      acc.get(isPrime(acc.get(true), candidate))
          .add(candidate);
    };
}
```

- 위의 코드에서 지금까지 발견한 소수 리스트(누적 맵의 true 키로 이들 값에 접근 가능)와 소수 여부를 확인하는 candidate를 인수로 isPrime 메소드를 호출한다.
- isPrime의 호출 결과로 소수 리스트 또는 비소수 리스트 중 알맞은 리스트로 candidate를 추가한다.

#### 3단계 : 병렬 실행할 수 있는 컬렉터 만들기
- 실제론 알고리즘은 순차적으로 진행되서 병렬로 사용되진 않는다.

```java
public BinaryOperator<Map<Boolean, List<Integer>>> combiner() {
    return (Map<Boolean, List<Integer>> map1,
            Map<Boolean, List<Integer>> map2) -> {
                map1.get(true).addAll(map2.get(true));
                map1.get(false).addAll(map2.get(false));
                return map1;
    };
}
```

- map1 true 키에매칭되는 값에다가 map2 true 키에 매칭되는 값들을 싹다 추가(false도 마찬가지)

#### 4단계 : finisher 메소드와 컬렉터의 characteristics 메소드
- accumulator의 형식은 컬렉터 결과 형식과 같으므로 변환 과정이 따로 필요 없다.
- 따라서 항등 함수 identity를 반환하도록 finisher를 구현한다.

```java
public Function<Map<Boolean, List<Integer>>, Map<Boolean, List<Integer>>> finisher() {
    return Function.identity();
}
```

- 커스텀 컬렉터는 CONCURRENT도 아니고 UNORDERED도 아니지만, IDENTITY_FINISH이므로 다음처럼 characteristics를 구현한다.

```java
public Set<Characteristics> characteristics() {
    return Collections.unmodifiableSet(EnumSet.of(Characteristics.IDENTITY_FINISH));
}
``` 

- 이제 요걸 6.4에서 했던 partioningBy를 이용했던 예제를 커스텀 컬렉터로 교체가 가능하다.

### 6-2. 컬렉터 성능 비교
- 성능비교할 소스를 등록해 본다.

```java
public class CollectorHarness {
    public static void main(String[] args) {
        long fastest = Long.MAX_VALUE;
        for (int i = 0; i < 10; i++) {
            long start = System.nanoTime();
            partitionPrimes(1_000_000);
            long duration = (System.nanoTime() - start) / 1_000_000;
            if (duration < fastest) fastest = duration;
        }
        System.out.println(
            "Fastest execution done in " + fastest + " msecs");
    }
}
```

## 7. 마치며
- collect는 스트림의 요소를 요약 결과로 누적하는 다양한 방법 (컬렉터라 불리는)을 인수로 갖는 최종 연산이다.
- 스트림의 요소를 하나의 값으로 리듀스하고 요약하는 컬렉터뿐 아니라, 최솟값, 최댓값, 평균값을 계산하는 컬렉터 등이 미리 정의되어 있다.
- 미리 정의된 컬렉터인 groupingBy로 스트림의 요소를 그룹화 하거나, partitioningBy로 스트림의 요소를 분할할 수 있다.
- 컬렉터는 다수준의그룹화, 분할, 리듀싱 연산에 적합하게 설계되어 있다.
- Collector 인터페이스에 정의된 메소드를 구현해서 커스텀 컬렉터를 개발할 수 있다.