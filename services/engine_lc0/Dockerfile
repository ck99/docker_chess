FROM centos:centos7
RUN yum install -y epel-release centos-release-scl && \
    yum install -y gcc gcc-c++ glibc-devel openblas-devel.x86_64 ninja-build protobuf-compiler meson git protobuf-devel llvm-toolset-7
RUN git clone https://github.com/LeelaChessZero/lc0.git && cd lc0 && scl enable devtoolset-7 'bash ./build.sh --default-library=static'

FROM centos:centos7
COPY --from=0 /lc0/build/release /lc0
COPY --from=0 /usr/lib64/libopenblas-* /usr/lib64/libopenblas.* /usr/lib64/libprotobuf* /usr/lib64/libgfortran.so* /usr/lib64/libquadmath.so* /usr/lib64/
RUN yum -y install nc
EXPOSE 8080
CMD ["/usr/bin/nc", "-lk", "-p", "8080", "-e", "/lc0/lc0 -w /weights"]