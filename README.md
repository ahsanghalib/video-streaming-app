# video-streaming-app

after cloning it.

to run:

1. make a 'files' folder in this directory root. (backend will make it auto but for safetly.)
2. docker-compose up -d
3. cd rabbitt -> npm run build -> npm run start
4. cd web -> npm run build
5. cd backend -> npm run build -> npm run start

check on localhost:4000

required:

1. docker

2. linux packages
sudo apt update
sudo apt install -y git build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev git

3. nginx with rtmp
git clone <https://github.com/arut/nginx-rtmp-module.git>
git clone <https://github.com/nginx/nginx.git>
cd nginx
./auto/configure --add-module=../nginx-rtmp-module
make
sudo make install
cp nginx.conf /usr/local/nginx/conf

4. ffmpeg
sudo add-apt-repository ppa:mc3man/trusty-media
sudo apt update
sudo apt install -y --no-install-recommends ffmpeg
