FROM centos:centos7

ARG SFVERSION=10

RUN yum -y install make gcc-c++ glibc-static libstdc++-static wget ca-certificates
RUN mkdir -p /root/tmp && \
	cd /root/tmp && \
	wget https://github.com/official-stockfish/Stockfish/archive/sf_${SFVERSION}.tar.gz && \
	tar xvf /root/tmp/sf_${SFVERSION}.tar.gz
RUN cd /root/tmp/Stockfish-sf_${SFVERSION}/src && \
	make build ARCH=x86-64-modern LDFLAGS="-m64 -Wl,--no-as-needed -lpthread -Wall -Wcast-qual -fno-exceptions -std=c++11  -pedantic -Wextra -Wshadow -m64 -DNDEBUG -O3 -DIS_64BIT -msse -msse3 -mpopcnt -DUSE_POPCNT -flto -static" && \
	mv /root/tmp/Stockfish-sf_${SFVERSION}/src/stockfish /usr/local/bin/stockfish


FROM alpine:3.8
COPY --from=0 /usr/local/bin/stockfish /usr/local/bin/stockfish
EXPOSE 8080
CMD ["/usr/bin/nc", "-lk", "-p", "8080", "-e", "/usr/local/bin/stockfish"]