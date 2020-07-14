# Set vars
DATA_DIR="$HOME/docker/angular_start"
CONTAINER_NAME="ui"
# Stop and remove the existing container if
# it is already running.
docker kill $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker run \
-d \
-m 850m \
-v /app/node_modules \
-p 4200:4200 \
--name $CONTAINER_NAME \
ui
