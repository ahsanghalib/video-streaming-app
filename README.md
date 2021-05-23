# video-streaming-app
after cloning it.

**to run first time:**
1. bash build.sh

**to run / rebuild:**
1. bash rebuild.sh

check on {hostname}:4000

**required:**
1. docker
```
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
sudo apt install docker-ce
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

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
--prefix=/opt/nginx/ \
--pid-path=/var/run/nginx.pid \
--conf-path=/etc/nginx/nginx.conf \
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

sudo make
sudo make install

sudo apt install certbot 
sudo certbot -d example.com -d www.example.com

sudo ufw enable
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'


cp nginx.conf /etc/nginx/conf/nginx.conf
```

4. ffmpeg
```
sudo add-apt-repository ppa:mc3man/trusty-media
sudo apt update
sudo apt install -y --no-install-recommends ffmpeg
```

5. node
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
source ~/.bashrc
nvm install v12.19.0
npm install pm2@latest -g
```