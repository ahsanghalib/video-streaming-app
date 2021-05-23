# video-streaming-app
after cloning it.

**to run:**
1. make a 'files' folder in this directory root. (backend will make it auto but for safetly.)
2. docker-compose up -d
3. cd rabbitt -> npm run build -> npm run start
4. cd web -> npm run build
5. cd backend -> npm run build -> npm run start

check on localhost:4000

**required:**
1. docker
```
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
```

2. linux packages
```
sudo apt update
sudo apt install -y git build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev git libgd-dev libxslt-dev libgeoip-dev
````

3. nginx with rtmp
```
git clone https://github.com/arut/nginx-rtmp-module.git
git clone https://github.com/nginx/nginx.git
cd nginx
sudo ./auto/configure \
--add-module=../nginx-rtmp-module \
--prefix=/opt/nginx/$NGINX_NAME_VERSION \
--pid-path=/var/run/nginx.pid \
--conf-path=/etc/nginx/$NGINX_NAME_VERSION/conf/nginx.conf \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--lock-path=/var/lock/nginx.lock \
--http-client-body-temp-path=/var/tmp/nginx/body \
--http-fastcgi-temp-path=/var/tmp/nginx/fastcgi \
--http-proxy-temp-path=/var/tmp/nginx/proxy \
--http-scgi-temp-path=/var/tmp/nginx/scgi \
--http-uwsgi-temp-path=/var/tmp/nginx/uwsgi \
--with-http_v2_module \
--with-http_flv_module \
--with-http_image_filter_module \
--with-http_addition_module \
--with-http_gzip_static_module \
--with-http_ssl_module \
--with-http_sub_module \
--with-http_xslt_module \
--with-mail \
--with-mail_ssl_module 

make
sudo make install

sudo apt install certbot python3-certbot-nginx
sudo certbot -d example.com -d www.example.com

sudo ufw enable
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'


cp nginx.conf /usr/local/nginx/conf
```

4. ffmpeg
```
sudo add-apt-repository ppa:mc3man/trusty-media
sudo apt update
sudo apt install -y --no-install-recommends ffmpeg
```
