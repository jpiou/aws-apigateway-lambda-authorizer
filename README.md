An easy Lambda auhtorizer for API gateway
See [https://docs.aws.amazon.com/fr_fr/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html](https://docs.aws.amazon.com/fr_fr/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)

Example :
> curl -X GET \  
[https://fi0sa9jjmf.execute-api.eu-west-1.amazonaws.com/stable/v2/secure/tokenize/VOD69217605485000](https://fi0sa9jjmf.execute-api.eu-west-1.amazonaws.com/stable/v2/secure/tokenize/VOD69217605485000) \  
-H 'x-api-key:myApiKey'
-H 'token:{TO_GENERATE}'

- nécessite une clé API (dans le header de la requête), nommé "**x-api-key**", spécifique au partenaire :
> myApiKey

- nécessite un jeton (dans le header de la requête), nommé "**token**", dont voici l'algorithme de génération à partir de l'**API key** et du **salt** :

> API_KEY = "myApiKey"
SALT = "mySalt"
TOKEN = sha1(concat(API_KEY, SALT, DATE(Ymd)))

#######

	 - Algorithme en PHP :
	 
    $apiKey = 'myApiKey';
	$salt = 'mySalt';
	$token = sha1($apiKey . $salt . date('Ymd'));

#######

	 - Algorithme en Javascript (inclure la librairie pour le sha1 https://www.npmjs.com/package/js-sha1):

    var now = new Date();           // fuseau horaire local
	var day= now.getUTCDate();
	var month= now.getUTCMonth() + 1;
	var year= now.getUTCFullYear();
	var stringYmd = String(year) + ('0' + String(month)).slice(-2) + String(day);

	var apikey = 'myApiKey';
	var salt = 'mySalt';
	var TOKEN = sha1(apikey + salt + String(stringYmd));

**remarques**

 - Utiliser les dates en **UTC** uniquement
 - Dans le fichier config.json, vous pouvez ajouter un ou plusieurs partenaires (pas de limitation sur le nombre et les valeurs) :

	    {
		   "apikey":"salt",
		   "partenaire-un":"nvQn2F7KP3VSArNd",
		   "partenaire-deux":"5kUsfbPNAxtpHT97",
		   "partenaire-trois":"DKKt44S3GZFxQrTG"
		}
