ffmpeg \
    -rtsp_transport tcp -i rtsp://admin:1987@Thanh@115.75.32.62:5555/profile2/media.smp \
        -framerate 30 -video_size 800x600 \
    -f mpegts \
        -codec:v mpeg1video -s 800x600 -b:v 1000k -bf 0 \
    http://localhost:${STREAM_PORT}/${STREAM_SECRET}
