# bash openStream.sh rtsp:// http://localhost:8081/123456789

ffmpeg \
    -rtsp_transport tcp -i $1 \
        -framerate 30 -video_size 800x600 \
    -f mpegts \
        -codec:v mpeg1video -s 800x600 -b:v 1000k -bf 0 $2
