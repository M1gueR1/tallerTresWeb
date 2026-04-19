El profesor indicó de responder únicamente las preguntas presentes en Tasks.md

## Question 1

En el primer escenario que se plantea, Mongo no detectaría duplicado, dado que este es case-sensitive.
Esto hace de que sin importar de que esté la misma palabra, en caso de haber mayúsculas que las diferencie, mongo no va a detectar el duplicado.

Sin embargo, en la línea de cars.service se hace:

```typescript
createCarDto.nombre = createCarDto.nombre.toLowerCase();
```

Notemos que esto lo que hace es mandar a minúscula el nombre del carro ANTES de que se guarde en la base de datos. Por lo tanto, sin importar que se mande la misma palabra con diferencia de mayúsculas, de todas formas Mongo detectaría el duplicado al estarse pasando ya el string en minúscula. Notemos que esto garantizaría en mejor medida la anotación @unique, lo cual llevaría a que el caso de McQueen y mcqueen arroje error 11000 por tener duplicación, verificando de mejor medida dicha restricción.

---

## Question 2

Existen ambas validaciones dado que cada una se ejecuta en una capa distinta del pipeLine de NestJS. Precisamente, ParseMongoIdPipe se encarga de  actuar antes de entrar al controlador, es decir, en la capa de transporte. Por otro lado, isValidObjectId ocurre dentro del servicio, es decir, en la capa de lógica.

Puntualmente, esta diferencia hace que el programa actúe distinto según el caso correspondiente. En el caso de FindOne, si no se usara el isValidObjectId, Mongoose intentaría hacer el findeId('abc'), pero fallaría el error dado que nunca se revisó si dicho id que se pasó por parámetro era válido y, adicionalmente, falla internamente por un CastError no manejado, lo cual hace que NestJS devuelva un error 500. Precisamente, el error es consecuencia de que el id 'abc' no se le pudiese hacer el casteo correspondiente al no tener el formato indicado.

En el segundo caso del remove, la petición se mandaría y llegaría hasta el servicio, y deleteOne con el id que se pasó no encontraría nada, es decir, el deletedCount correspondería a 0 y se mandaría un BadRequestException, recibiendo así un error 400.

En cuanto a la diferencia entre ambos, es justamente la mencionada al inicio, en donde el ParseMongoIdPipe ocurre antes de llegar al controlador y, en caso de ser controlado bota error 400 y el controlador no se enteraría de esto. En cambio, el otro se ejecuta justamente ya cuando se llegó al servicio más tarde, lo cual hace que se genere este error de 500

---


## Question 3

Create necesita de un try/catch dado que al momento de intentar crear un documento nuevo, se podría dar el caso de violar alguna restricción (como unique: true), lo cual generaría el lanzamiento del error 11000 por duplicate key. Por otro lado, el findAll() ejecuta únicamente un find() que devuelve todos los documentos ya existentes, es decir, se limita a leer y, por lo tanto, no hay ningún constraint que se pudiese violar al intentar leer, es decir, no se lanzaría un error por duplicado.

En caso de quitar el try/catch en el create, y se llegase a violar una restricción unique, se lanzaría un error 11000, Nest no sabría qué hacer con dicho error al no ser manejada por Mongoose, devolviendo así un error 500. Precisamente, recordemos que este error subiría por la pila hasta llegar al exception filter de NestJS, finalmente haciendo que se bote error 500. Sin embargo, notemos que justamente en el código se utiliza un HandleException para convertir dicho error de 11000 a 400 (para que no se bote error 500, pues en realidad se trata de un error por parte del usuario).

---


## Question 4

Con la forma en que se está haciendo en el código, ocurren 2 consultas: la primera al hacer el findOne() que lo que se encarga de hacer es precisamente un findById (primera query). La segunda ocurre para actualizar el cambio y que se vea reflejado en la base de datos: esto ocurre en car.updateCar(updateCarDTO). Notemos que al hacer el spread no se vuelve a consultar a la base de datos.

En cuanto a si puede haber cambios, efectivamente si: precisamente el método retorna { ...car.toJSON(), ...updateCarDto }, que es una mezcla en memoria, no una lectura post-update. Esto quiere decir que el spread pone los valores por encima de los que ya están antes en un objeto JS, pero no se realiza una verificación post-update de si eso quedó guardado en el Mongo DB.

Un ejemplo de esto podría ser: el updateCarDto tiene nombre: "mcqueen" pero el servicio normaliza a mayúsculas solo en create, no en update. La API retornaría nombre: "mcqueen" pero MongoDB podría tener guardado algo distinto si hay lógica de transformación en el schema. El cliente recibe datos que no reflejan la realidad de la BD. Otro ejemplo podría sería que se guarde un campo y al momento de intentar guardarlo se modifique a que todo ese campo esté en mayúsculas: en tal escenario, la API estaría devolviendo el string original, mientras que en la base de datos se guardaría con dicho cambio en mayúsculas.

---


## Question 5

El problema es que JavaScript evalúa process.env.MONGODB_URL en el momento en que se parsea el módulo, es decir, al inicio de la aplicación antes de que ConfigModule.forRoot() haya terminado de cargar el .env. Precisamente, en ese momento el ConfigModule aún no se ha ejecutado, lo que hace que  no haya podido inicializar los modulos.

Ahora bien, el forRoot normalito con esta información `MongooseModule.forRoot(process.env.MONGODB_URL || 'mongodb://localhost:27017/nest-cars')`
lo que haría es buscar el MONGODB_URL justo después de ya haber cargado el módulo. Sin embargo, con esta solución en caso que dicha URL (es decir, el process.env.MONGODB_URL) fuese undefinied, entonces se estaría accediendo a una ruta localhost que serviría únicamente en caso de tener desplegada la aplicación (principalmente la base de datos) de forma local (lo cual no serviría en caso de tener la base de datos no local).

En cambio, el forRootAsync soluciona este problema dado que el useFactory se ejecuta de forma diferida, después de que todos los módulos del imports array (incluido ConfigModule) han sido inicializados. Para ese momento el .env ya está cargado y ConfigService puede leerlo correctamente, solucionando el problema mencionado antes.

---


## Question 6

En el caso del estudiante 1, no se ejecuta ni se presenta algún error al momento de arrancar la app. Sin embargo, dado que Nest no registra el modulo de cars, al momento de intentar buscar una ruta api/cars, Nest no encontraría ningún controlador registrado para esa ruta, mostrando así un error 404 en runtime, no en startup. El error que aparecería sería `Cannot GET /api/cars`.

Ahora, en el segundo escenario, si ocurre un error al momento de arrancar la aplicación. Precisamente, en este caso cuando Nest intente crear el servicio de carros CarsService, necesita inevitablemente inyectar el modelo de Car, pero dado que este no se registró en el forFeature, no se encuentra la dependencia para hacer el `@InjectModel(Car.name)`, botando el siguiente error:

Nest can't resolve dependencies of the CarsService (?).
Please make sure that the argument CarModel is available in the CarsModule context.

Para solucionarlo, se miraría el archivo cars.module.ts y revisar que sí se encuentre MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])

---


## Question 7

Hay una ventaja cuando no se pone un findOne() antes de el deleteOne, y es una consulta menos en la base de datos. En pocas palabras, solo hace una query en lugar de dos. Es más eficiente, pues ejecuta dicha operación en una sola operación atómica. Adicionalmente, notemos que podría presentarse un escenario de Race Condition, pues podría darse que entre 2 queries separadas el ocumento sea borrado por otra operación externa entre el findOne y el deleteOne. Notemos que esto podría llevar a posibles inconsistencias y fallas, pues en un inicio se hubiese verificado que existía el documento por el findOne(), pero puede que entre esas 2 queries se haya eliminado.

Un escenario en el que ocurre eso es precisamente si se pasa por id para eliminar uno que tenga el formato válido, pero que no exista en la base de datos. En tal caso, el deletecCount sería 0 al no haber eliminado ningún documento.

---

## Question 8

Se pierde la separación de responsabilidades. El pipe actúa en la capa de transporte, antes de que el controlador procese la request. Si el id es inválido, la request se rechaza inmediatamente sin llegar al servicio ni a la base de datos. Precisamente, si la validación está en el servicio, la request ya entró al sistema, se instanció el controlador, se llamó al método — trabajo innecesario antes de fallar. Esto lleva a que la ventaja arquitectural (adicional a la mencionada antes de separación de responsabilidades) es que se pierde la reutilización, pues el Pipe se puede poner de manera más fácil con tan solo ponerlo entre los parámetros del decorador @Param. En cambio, en caso de hacer dicho cambio mencionado, tocaría poner en cada parte del service donde se quiera validar un ObjectId lo mismo una y otra vez.

Ahora bien, el pipe se llega a ejecutar en la etapa de **Pipes/Decorators**, es decir, antes de que el controlador ejecute el request.

Por otro lado, si se elimina lo anterior, NestJS recurre a su sistema de inyección de dependencias para crear instancias de los pipes definidos como clases. Sin el decorador @Injectable(), el framework no puede gestionarlos a través de este mecanismo. Aun así, si el pipe no depende de ningún servicio, puede ser instanciado manualmente con new sin inconvenientes. El problema aparece cuando el pipe requiere inyectar dependencias, ya que en ese caso la aplicación fallará al iniciar.

---

## Question 9

En el primer escenario no se modifica el comportamiento. Estas tres llamadas únicamente configuran el objeto app, y no existe dependencia entre ellas en cuanto al orden. Tanto el prefijo como la configuración de CORS se aplican cuando se procesa una solicitud, no en el momento en que se invocan esos métodos. Además, no importa el orden entre ellas porque todas se aplican antes de que llegue cualquier request. 

En este caso sí existe un posible problema. app.listen() es una operación asíncrona que pone en marcha el servidor. Si enableCors() se ejecuta después sin usar await, el servidor podría empezar a recibir solicitudes antes de que CORS haya sido configurado. Como resultado, las primeras peticiones de origen cruzado podrían ser rechazadas. Por ello, enableCors() debe definirse antes de app.listen() para asegurar que el middleware esté presente en el pipeline desde la primera solicitud.


---