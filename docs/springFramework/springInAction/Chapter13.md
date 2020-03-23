## Chapter13# 캐시 지원하기

https://www.evernote.com/l/Annr3ev0SuJEsYYjzJuPTCmGmRngnc6VeWc


### 1. 캐시지원하기 

스프링에서는 아래 두가지 형태로 캐시를 지원한다.
* 어노테이션 주도 캐싱
* XML선언적 캐싱

어노테이션 주도 캐싱을 사용하기 위한 설정  
: 캐싱어노테이션을 하는 point-cut을 가지는 에스펙트를 생성한다.  
  어노테이션에 따라 에스팩트는 캐시의 값을 가져오고, 값을 추가하고,   값을 삭제하는 일을 수행한다.  

**(1) java기반 설정  - EnableCaching 어노테이션 사용** 
```java
package com.habuma.cachefun;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager; import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching                                                                    //캐싱 활성화
public class CachingConfig {
    @Bean
    public CacheManager cacheManager() {                           //캐시매니져 설정
        return new ConcurrentMapCacheManager();
    }
}
```

**(2) XML기반 설정  - < cache:annotation-driven > 사용**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cache="http://www.springframework.org/schema/cache"
        xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/cache
        http://www.springframework.org/schema/cache/spring-cache.xsd">
<cache:annotation-driven />                                                                                                //캐싱 활성화
<bean id="cacheManager" class=                
        "org.springframework.cache.concurrent.ConcurrentMapCacheManager" />             // 캐시매니저 선언
</beans>
```
캐싱어노테이션을 하는 point-cut을 가지는 에스펙트를 생성한다.  
어노테이션에 따라 에스팩트는 캐시의 값을 가져오고, 값을 추가하고, 값을 삭제하는 일을 수행한다.  
 
#### 1.1 캐시매니저 설정하기
스프링에서 지원하는 캐시매니저 구현체들   
*  SimpleCacheManager
*  NoOpCacheManager
*  ConcurrentMapCacheManager 
*  CompositeCacheManager
*  EhCacheCacheManager ( ↑ spring 3.1)
* RedisCacheManager (↓ spring 3.2)
* GemfireCacheManager

**(1) EhCache로 캐싱하기 : 자바에서 가장 보편적이고으로 사용되는 캐시프로바이더**
```java
@Configuration
@EnableCaching
public class CachingConfig {
    @Bean
    public EhCacheCacheManager cacheManager(CacheManager cm) {                        // EhCacheCacheManager 설정
        return new EhCacheCacheManager(cm);
    }

    @Bean
    public EhCacheManagerFactoryBean ehcache() {                                                       // EhCacheManagerFactoryBean
        EhCacheManagerFactoryBean ehCacheFactoryBean =
                new EhCacheManagerFactoryBean();
        ehCacheFactoryBean.setConfigLocation(
                new ClassPathResource("com/habuma/spittr/cache/ehcache.xml"));
        return ehCacheFactoryBean;
    }
}
```
EhCacheManagerFactoryBean을 생성하며 XML파일의 위치를 지정하기 위해setConfigLocation을 호출한다. 
ClassPathResource을 param으로 전달하여 선언 
```xml
<ehcache>
<cache name="spittleCache"
        maxBytesLocalHeap="50m"
        timeToLiveSeconds="100">
</cache>
</ehcache>
```
spittleCache라는 이름의 캐시를 50MB의 heap영역에 100초간 저장한다.   


**(2) 캐싱을 위해 Radis 사용하기 : 캐시를 key-value 형태로 저장/관리한다.**
RedisTemplate 빈과 RedisConnectionFactory 빈을 통해 RedisCacheManager를 설정한다. 
```java 
@Configuration
@EnableCaching                                                                 
public class CachingConfig {
    @Bean
    public CacheManager cacheManager(RedisTemplate redisTemplate) {
        return new RedisCacheManager(redisTemplate);                                                // RedisCacheManager Bean 
    }
    @Bean
    public JedisConnectionFactory redisConnectionFactory() {                                   // RedisConnectionFactory Bean
        JedisConnectionFactory jedisConnectionFactory =
                new JedisConnectionFactory();
        jedisConnectionFactory.afterPropertiesSet();
        return jedisConnectionFactory;
    }
    @Bean
    public RedisTemplate<String, String> redisTemplate(                                           // RedisTemplete
            RedisConnectionFactory redisCF) {
        RedisTemplate<String, String> redisTemplate =
                new RedisTemplate<String, String>();
        redisTemplate.setConnectionFactory(redisCF);
        redisTemplate.afterPropertiesSet();
        return redisTemplate;
    } 
}
```
**(3) 다중 캐시 매니저 사용하기 : 여러개의 캐시 매니저를 사용 할 수 있다.**
CompositeCacheManager를 사용하면 한개 이상의 캐시매니저를 설정할수 있다.   
```java
@Bean
public CacheManager cacheManager(
               net.sf.ehcache.CacheManager cm,
               Create javax.cache.CacheManager jcm) {
        CompositeCacheManager cacheManager = new CompositeCacheManager();
        List<CacheManager> managers = new ArrayList<CacheManager>();
        managers.add(new JCacheCacheManager(jcm));
        managers.add(new EhCacheCacheManager(cm))
        managers.add(new RedisCacheManager(redisTemplate()));
        cacheManager.setCacheManagers(managers);
        return cacheManager;
        }
```


### 2. 캐싱을 위한 어노테이션 메소드   

스프링에서 제공하는 캐싱을 위한 어노테이션 - 메소드와 클래스 모두에 사용 가능하다.   
* @Cacheable : 메소드 사용전에 return값을 위해 캐시를 확인한다.   
                               값이 존재하는 경우 캐싱된 값이 반환되고, 없는 경우 메소드를 실행하여 반환된 값이 캐시에 저장된다. 
* @CachePut : 메서드 return 값을 캐시에 저장된다. 캐시에 대한 체크 없이 메소드는 항상 실행된다.   
* @CacheEvict : 1이상의 엔트리를 캐시에서 내쫒..(?)는다 삭제한다(?)  
* @Caching : 다른 캐싱어노데이션을 여러번 적용하기 위한 그룹 어노테이션  

#### 2.1 캐시채우기  
@Cacheable과 @CachePut 어너테이션은 모두 캐시에 값을 저장한다.   
두 ㅇㅓ노테이션에서 사용되는 어트리뷰트  
* value ( String[] ) : 사용할 캐시 명
* condition ( String) : SpEL표현식, 값이 false 인 경우 메소드 호출에 적용되지 않음 
* key (String) : 맞춤형 캐시 키를 저장하기 위한 SpEL표현식
* unless (String) : SpEL표현식, 값이 true 인 경우 반환값이 캐시에 남지 않음 
```java
@Cacheable 어노테이션을 이용한 findOne()메소드 적용
@Cacheable("spittleCache")
public Spittle findOne(long id) {
        try {
            return jdbcTemplate.queryForObject(
            SELECT_SPITTLE_BY_ID,
            new SpittleRowMapper(),
            id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        } 
}
```
findOne()호출 시 캐싱 애스팩트는 호출을 가로 채 spittleCache라는 캐시의 값을 찾는다.   
이때  key는 paramater로 전달되는 id이며 값이 있다면 메소드를 실행하지않고 캐시값을 리턴하며, 없는 경우 함수를 실행하고 리턴 값이 캐시에 저장된다.  

이 과정에서 DB로의 접근이 줄어 시간과 리소스의 낭비를 줄일 수 있다.  

공통처리를 위한 @Cacheable 어노테이션 설정  
@Cacheable("spittleCache")
Spittle findOne(long id); 

위 처럼 구현체가 아닌 인터페이스에 선언하는 경우 해당 인터페이스를 받는 모든 구현채에서 캐싱이 적용된다.  


**(1) 캐시에 값넣기**  
@CachePut 어노테이션을 이용해 항상 값을 저장한다.    
@CachePut("spittleCache")  
Spittle save(Spittle spittle);  

**(2) 맞춤형 캐시 키 만들기**   
save()함수 같은 경우 아직 Spittle가 저장되지 않았으므로 id를 가질 수 없다. 따라서 별도의 key를 설정하거나 저장 후 생성될 id가 필요하다

스프링에서 제공하는 SpEL표현식들  
* #root.args : 캐시된 메소드에 베열로 전달된다. 
* #root.caches : 메소드가 수행된 캐시이며 배열과 같다.
* #root.target : 타깃 객체 나타낸다.
* #root.targetClass : 타깃 객체의 클래스이다. #root.target.class의 숏컷이다. 
* #root.method : 캐시된 메소드다.
* #root.methodName : 캐시된 메소드 명이다. #root.method.name의 숏컷이다. 
* #result : 메소드 호출에서 반환된 값이다. (@Cacheable에 대해선 미적용)
* #Argument : 메소드(#argName)
*  인자명 또는 인자의 인덱스(#a0, #p0)
 
@CachePut("spittleCache", key="#result.id")
Spittle save(Spittle spittle);

**(3) 조건 캐싱**  
- 메세지 property에 NoCache가 포함되는 경우 캐싱하지 않는 예제 
@Cacheable(value="spittleCache"
        unless="#result.message.contains('NoCache')")
Spittle findOne(long id);

- spittle의 id가 10보다 작을때 캐싱하지 않는 예제 
```java
@Cacheable(value="spittleCache"
        unless="#result.message.contains('NoCache')"
        condition="#id >= 10")
Spittle findOne(long id);
```
#### 2.2 캐시 삭제하기 
캐시값이 더 이상 유효하지 않은경우 캐시에서 제거가 필요하다.
```java
@CacheEvict("spittleCache")
        void remove(long spittleId);
※ CacheEvict은 void 메소드에서 사용된다. 
```
@CacheEvict 어노테이션에서 사용되는 어트리뷰트
* value ( String[] ) : 사용할 캐시 명
* key (String) : 맞춤형 캐시 키를 계산하기 위한 SpEL표현식
* condition ( String) :  false 인 경우 메소드 호출에 적용되지 않음 
* allEntries (boolean) : true 값을 가지면 지정된 캐시 내의 모든 엔트리들 제거된다. 
* beforeInvocation (boolean) : true 값을 가지면 메소드 수행되기 전에 삭제된다. 
                                                        false값을 가지면 메소드가 수행된 후 제거된다. 

### 3. XML에서 캐싱 선언하기



