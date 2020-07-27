# 로컬에서 카프카 설치하고 메세지 보내기

### 카프카 설치 
- https://kafka.apache.org/downloads 에 접속해 Binary downloads하위 압축파일을 다운아 압축을 푼다.

--------
### zookeeper 실행
- 카프카 설치 디렉토리로 이동한다.
- 아래 명령어로 zookeeper를 실행한다.
```
bin/zookeeper-server-start.sh config/zookeeper.properties
```
---------
### kafka 실행
- 카프카 설치 디렉토리로 이동한다.
- 아래 명령어로 kafka를 실행한다.
```
bin/kafka-server-start.sh config/server.properties
```
--------
### 토픽

#### 토픽생성 
```
bin/kafka-topics.sh -create -zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test

Created topic "test".
```

#### 토픽확인
```
bin/kafka-topics.sh --list --zookeeper localhost:2181                 

test
```

#### 토픽삭제
```
bin/kafka-topics.sh --delete --zookeeper localhost:2181 --topic test
```
-------
### 메시지 송/수신

#### Producer 실행 
신규 콘솔창을 켠다
```
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
```

#### Consumer 실행
신규 콘솔창을 켠다
```
bin/kafka-console-consumer.sh -zookeeper localhost:2181 --topic test --from-beginning
```
