import express, {Request, NextFunction, Response, Errback} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {IndexRouter} from "./V0/index.router";
import fs from "fs";

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.use("/api/v0/", IndexRouter)
    
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  function cleanUp(err:Errback) {
    next();
  }
  app.use(cleanUp)
  
  app.use((req,resp,next)=>{
    next()
  })
  
  app.get( "/filteredimage", async ( req, res ) => {
    let {img_url} = req.query;
    let storePath:string="";
    if (!img_url)
      return res.status(400).send("img_url is missing.");

    try {
      storePath = await filterImageFromURL(img_url);
      //return res.status(200).send("Stored image:" + img_url + "\n to :" + storePath);
      return res.status(200).sendFile(storePath, cleanUp);
    } catch (e) {
      return res.status(404).send("Image url is not accessible!\n" + e);
    } finally {
      // if(fs.existsSync(storePath))
      //   await deleteLocalFiles([storePath])
    }

  },(req,resp,next)=>{
    
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();