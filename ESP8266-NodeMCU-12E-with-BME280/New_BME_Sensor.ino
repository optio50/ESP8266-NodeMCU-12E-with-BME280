#include <Wire.h>
#include <ESP8266WiFi.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

//#define BMP_SCK 13
//#define BMP_MISO 12
//#define BMP_MOSI 11 
//#define BMP_CS 10

float h, t, p, pin, dp;
char temperatureFString[6];
char dpString[6];
char humidityString[6];
char pressureString[7];
char pressureInchString[6];

Adafruit_BME280 bme; // I2C
// replace with your channel’s thingspeak API write key,
String apiKey = "MZKW8VSNDF2SINB7";
// replace with your routers SSID
const char* ssid = "Connection Disabled";
// replace with your routers password
const char* password = "Wireless#18016";

const char* server = "api.thingspeak.com";
WiFiClient client;


/**************************  
 *   S E T U P
 **************************/
// only runs once on boot
void setup() {
  // Initializing serial port for debugging purposes
  Serial.begin(115200);
  delay(10);
  Wire.begin(D3, D4);
  Wire.setClock(100000);
  // Connecting to WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
    // Printing the ESP IP address
  Serial.println(WiFi.localIP());
  Serial.println(F("BME280 test"));

  if (!bme.begin()) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    while (1);
  }
}

  /**************************  
 *  L O O P
 **************************/
void loop() {
    h = bme.readHumidity();
    t = bme.readTemperature();
    t = t*1.8+32.0;
    dp = t-0.36*(100.0-h);
    
    p = bme.readPressure()/100.0F;
    pin = 0.02953*p;
    dtostrf(t, 5, 1, temperatureFString);
    dtostrf(h, 5, 1, humidityString);
    dtostrf(p, 6, 1, pressureString);
    dtostrf(pin, 5, 2, pressureInchString);
    dtostrf(dp, 5, 1, dpString);
    delay(10000);

    Serial.print("Temperature = ");
    Serial.println(temperatureFString);
    Serial.print("Humidity = ");
    Serial.println(humidityString);
    Serial.print("Pressure = ");
    Serial.println(pressureString);
    Serial.print("Pressure Inch = ");
    Serial.println(pressureInchString);
    Serial.print("Dew Point = ");
    Serial.println(dpString);
    
    if (client.connect(server,80))  // "184.106.153.149" or api.thingspeak.com
    {
        String postStr = apiKey;
        postStr +="&field1=";
        postStr += String(temperatureFString);
        postStr +="&field2=";
        postStr += String(humidityString);
        postStr +="&field3=";
        postStr += String(pressureInchString);
        postStr += "\r\n\r\n";
        
        client.print("POST /update HTTP/1.1\n");
        client.print("Host: api.thingspeak.com\n");
        client.print("Connection: close\n");
        client.print("X-THINGSPEAKAPIKEY: "+apiKey+"\n");
        client.print("Content-Type: application/x-www-form-urlencoded\n");
        client.print("Content-Length: ");
        client.print(postStr.length());
        client.print("\n\n");
        client.print(postStr);    
    }
    client.stop(); 
    //every 5 Min   
    delay(300000);
}

