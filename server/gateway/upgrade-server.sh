docker pull magdanat/finalapiserver

docker rm -f 441finalgateway

export TLSCERT=/etc/letsencrypt/live/fpapi.nathanmagdalera.me/fullchain.pem
export TLSKEY=/etc/letsencrypt/live/fpapi.nathanmagdalera.me/privkey.pem
export DSN="root:password@tcp(441finaldb:3306)/db"
export MYSQL_ROOT_PASSWORD=password
export MESSAGESADDR=messagetest:4001
export RABBITADDR=rabbitmq:5672
#export RABBITNAME=MessageQ

docker run --network customNet -d --name 441finalgateway -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro -e RABBITADDR=$RABBITADDR -e TLSCERT=$TLSCERT -e DSN=$DSN -e MESSAGESADDR=$MESSAGESADDR -e TLSKEY=$TLSKEY -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD magdanat/finalapiserver

echo We have reached the end