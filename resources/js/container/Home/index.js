import React from 'react'
import Dropzone from 'react-dropzone'
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import Modal from 'react-responsive-modal';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/htmlmixed/htmlmixed'
import RemoveIcon from 'react-icons/lib/fa/close'

import imagetoPdf from '../../includes/pdf.js'
import './style.scss'
import 'slick-carousel/slick/slick.css';
import Slider from "react-slick";

export default class Home extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      showResult: false,
      value: 'polygon',
      imageUrl: '',
      imagePreviewUrl: undefined,
      imageWidth: undefined,
      imageHeigth: undefined,
      polygonDraggingPosition: undefined,
      rectangleDraggingPosition: undefined,
      circleDraggingPosition: undefined,
      polygonIsDrawing: false,
      rectangleIsDrawing: false,
      circleIsDrawing: false,
      listPolygon: [],
      pdfTempPolygon: [],
      pdfTempRectangle: [],
      pdfTempCircle: [],
      polygonHighlighted: [],
      rectangleHighlighted: [],
      circleHighlighted: [],
      hoverOn: false,
      showDetailsPopup: false,
      pdfImages: [],
      listPolygonLink:[],
      listRectangleLink:[],
      listCircleLink:[],
      link: '',
      LinkText: '',
      LinkTarget: '',
      productSKU: '',
      productName: '',
      polygonCurrentPopup: '',
      rectancleCurrentPopup: '',
      circleCurrentPopup: '',
      pdfLoaded: false,
      prevPdfPolygonData: [],
      prevPdfRectangleData: [],
      prevPdfCircleData: [],
      currentImageIndex: '0',
      images: [],
      listRectangle: [],
      listCircle: [],
      popupElementType: ''
    }
  }

  handleChange = (event, index, value) => {
    this.setState({
      value: value
    });
  }

  onDrop(files) {
    let reader = new FileReader();
    let file = files[0];
    reader.onloadend = () => {
      if(file.type == "application/pdf") {
        let images = this.imagetoPdf(reader.result);
      } else {
        this.setState({
          imagePreviewUrl: reader.result
        })
      }
    }

    reader.onload = (theFile) => {
      let image = new Image();
      image.src = theFile.target.result;
      var imageArray = this.state.images
      imageArray.push( image.src )
      image.onload = () => {
        this.setState({
          imageWidth: image.width,
          imageHeigth: image.height,
          images: imageArray
        })
      }
    }

    reader.readAsDataURL(file)
  }

imagetoPdf(file) {

  var images= [], currentPage = 1;
  var scale = 1;

  PDFJS.disableWorker = true; // due to CORS
  let home = this;
  PDFJS.getDocument(file).then(function (pdf) {
      
      getImages();

      function getImages() {
          pdf.getPage(currentPage).then(function(page) {
              var viewport = page.getViewport(scale);
              var canvas = document.createElement('canvas') , ctx = canvas.getContext('2d');
              var renderContext = { canvasContext: ctx, viewport: viewport };

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              page.render(renderContext).then(function() {
                  images.push({
                    "url" : canvas.toDataURL(),
                    "height" :  viewport.height,
                    "width" :  viewport.width
                  });

                  if (currentPage < pdf.numPages) {
                      currentPage++;
                      getImages();
                  } else {
                      var imageArray = []

                      var polygonData = home.state.prevPdfPolygonData

                      var RectangleData = home.state.prevPdfRectangleData

                      var circleData = home.state.prevPdfCircleData

                      var sliderImages = images.map(function (image, index) {

                        polygonData[index] = [];

                        RectangleData[index] = [];

                        circleData[index] = [];

                        imageArray.push( image.url )
                        return (
                          <div key={index}  onClick={() => this.changeMainImage(image.url,image.height,image.width,index)}><img src={image.url} /></div>
                        );
                      }.bind(home));

                      home.setState({
                          imagePreviewUrl: images[0].url,
                          pdfImages: sliderImages,
                          imageHeigth: images[0].height,
                          imageWidth: images[0].width,
                          pdfLoaded: true,
                          currentImageIndex: 0,
                          images: imageArray,
                          prevPdfPolygonData: polygonData,
                          prevPdfRectangleData: RectangleData,
                          prevPdfCircleData: circleData
                      })

                  }
              });
          });
      }    
  });
  
  return images;
}

  changeMainImage(url,height,width,index) {
    var prevPolygonData = []
    var prevRectangleData = []
    var prevCircleData = []
    if( this.state.prevPdfPolygonData[index] ) {
      var prevPolygonData = this.state.prevPdfPolygonData[index]
    }
    if( this.state.prevPdfRectangleData[index] ) {
      var prevRectangleData = this.state.prevPdfRectangleData[index]
    }
    if( this.state.prevPdfCircleData[index] ) {
      var prevCircleData = this.state.prevPdfCircleData[index]
    }
    this.removeAllImageMap();
    this.setState({
      imagePreviewUrl: url,
      imageHeigth: height,
      imageWidth: width,
      currentImageIndex: index,
      listPolygon: prevPolygonData,
      listRectangle: prevRectangleData,
      listCircle: prevCircleData
    })    
  }

  handleUrlImageChanged(value){
    this.setState({
      imageUrl: value
    })
  }

  getImageContainer(){
    let output = (
      <div className="drop-file-container">
        <div className="dropzone">
          <Dropzone onDrop={(file) => this.onDrop(file)}>
            <p>Drop File Here</p>
          </Dropzone>
        </div>
        <div>
          <Paper zDepth={3}>
            <div className="clippath-description">
              The clipPath SVG element defines a clipping path. A clipping path is used/referenced using the clip-path property.
              The clipping path restricts the region to which paint can be applied. Conceptually, any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
              A clipping path is conceptually equivalent to a custom viewport for the referencing element.
              Thus, it affects the rendering of an element, but not the element's inherent geometry.
              The bounding box of a clipped element (meaning, an element which references a clipPath element via a clip-path property,
              or a child of the referencing element) must remain the same as if it were not clipped.
            </div>
          </Paper>
        </div>
      </div>
    )
    if(this.state.imagePreviewUrl){

      var imageViewBoxHeight = '';
      var imageViewBoxWidth = '';

      if( this.state.imageWidth != undefined && this.state.imageHeigth != undefined ) {
        imageViewBoxHeight = this.state.imageHeigth;
        imageViewBoxWidth = this.state.imageWidth;
      } else {
        imageViewBoxHeight = '0';
        imageViewBoxWidth = '0';
      }
      
      output = (
        <div>
          <div className="image-carousel-container">
                {this.showCarousel()}
          </div>
          <div className="image-stage-container">
            <div>
              <img src={this.state.imagePreviewUrl} width="100%" height="auto" className="main-image" />
              <svg viewBox={"0 0 " + imageViewBoxWidth +" "+ imageViewBoxHeight}
                className="svg-container"
                onMouseDown={(e) => this.addRectOnImage(e)}
                onMouseMove={(e) => this.handleMouseMove(e)}
              >
                {this.generatePolygon()}
                {this.generateRectangles()}
                {this.generateCircle()}
              </svg>
            </div>
          </div>
        </div>
      )
    }
    return output
  }

  showCarousel(){

    var settings = {
      dots: true,
      infinite: false,
      autoplay: false,
      slidesToShow: 2,
      slidesToScroll: 1,
      vertical: true,
      arrows: true,
      draggable: true,
      dotsClass:"vertical-dots"
    };
    return (
      <div className='container'>
        <Slider {...settings}>
            {this.state.pdfImages}
        </Slider>
      </div>
    );
  }

  stopDrawing(e){
    e.stopPropagation()
    if( this.state.value == 'polygon' ) {
      this.setState({
        polygonIsDrawing: false,
        polygonDraggingPosition: undefined
      })
    } else if( this.state.value == 'rectangle' ) {
      this.setState({
        rectangleIsDrawing: false,
        rectangleDraggingPosition: undefined
      })
    } else if( this.state.value == 'circle' ) {
      this.setState({
        circleIsDrawing: false,
        circleDraggingPosition: undefined
      })
    }
  }

  stopRectangleDrawing(){
    if( this.state.value == 'polygon' ) {
      this.setState({
        polygonIsDrawing: false,
        polygonDraggingPosition: undefined
      })
    } else if( this.state.value == 'rectangle' ) {
      this.setState({
        rectangleIsDrawing: false,
        rectangleDraggingPosition: undefined
      })
    } else if( this.state.value == 'circle' ) {
      this.setState({
        circleIsDrawing: false,
        circleDraggingPosition: undefined
      })
    }
  }

  generateRectPoint(obj) {

    var objectHeight = ( 6 / document.querySelector(".image-stage-container div").offsetHeight ) * this.state.imageHeigth

    let listRect = ''

    if( this.state.value == "polygon" ) {

      listRect = obj.coordinates.map((objRect, rectIndex) => {
        const finishDrawing = rectIndex === 1
        return (
          <circle
            className="circle"
            key={rectIndex}
            r={objectHeight}
            cx={objRect.x}
            cy={objRect.y}
            onMouseDown={(e) => this.stopDrawing(e, finishDrawing)}
          />
        )
      })

    } else if( this.state.value == "rectangle" ) {
      listRect = obj.coordinates.map((objRect, rectIndex) => {
        return (
          <circle
            className="circle"
            key={rectIndex}
            r={objectHeight}
            cx={objRect.x}
            cy={objRect.y}
          />
        )
      })

    } else if( this.state.value == "circle" ) {
      listRect = obj.coordinates.map((objRect, rectIndex) => {
        return (
          <circle
            className="circle"
            key={rectIndex}
            r={objectHeight}
            cx={objRect.x}
            cy={objRect.y}
          />
        )
      })

    }

    return listRect
  }

  generatePolygon(){
    let polygons = this.state.listPolygon.map((obj, index) => {
      const listRect = this.generateRectPoint(obj)
      const arrayPoint = obj.coordinates.map((objPolygon, polygonIndex) => {
        return `${objPolygon.x},${objPolygon.y}`
      })
      const points = arrayPoint.join(' ')
      const polygonClassName = this.state.polygonIsDrawing && index === this.state.listPolygon.length - 1 ? 'polygon drawing' : 'polygon'
      var gClassName = this.state.polygonIsDrawing && index === this.state.listPolygon.length - 1 ? 'drawing' : '';
      gClassName += this.state.polygonHighlighted[index]  ? ' hover-on' : '';
      let coordinates = `${points}`
      if(this.state.polygonDraggingPosition !== undefined && index === this.state.listPolygon.length - 1){
        coordinates += ` ${this.state.polygonDraggingPosition}`
      }

      var objectHeight = ( 90 / document.querySelector(".image-stage-container div").offsetHeight ) * this.state.imageHeigth

      var objectWidth = ( 24 / document.querySelector(".image-stage-container div").offsetWidth ) * this.state.imageWidth

      return (
        <g key={index} className= {gClassName} onMouseOver={(e) => this.showElements(e, index, "polygon")} onMouseOut={(e) => this.hideElements(e, index, 'polygon')}>
          <polygon className={polygonClassName} points={coordinates} />            
          <foreignObject x={obj.coordinates[0].x} y={obj.coordinates[0].y}  style={{ height: objectHeight, width: objectWidth }}>
              <svg className="remove" viewBox="0 0 475.2 475.2" onClick={() => this.handleRemoveListImageMap(index, 'polygon')}><g><path d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1    l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4    c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"></path></g></svg>
              <svg className="settings" viewBox="0 0 475.2 475.2" onClick={() => this.openDetailsPopup(index, 'polygon')}><g> <path d="M454.2,189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8,7.1-27.9-3.2-38.1l-29.8-29.8 c-5.6-5.6-13-8.7-20.9-8.7c-6.2,0-12.1,1.9-17.1,5.5l-27.8,19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2 c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5,0-26.8,10.4-29.2,24.7l-5.8,34c-11.2,3.5-22.1,8.1-32.5,13.7l-27.5-19.8 c-5-3.6-11-5.5-17.2-5.5c-7.9,0-15.4,3.1-20.9,8.7l-29.9,29.8c-10.2,10.2-11.6,26.3-3.2,38.1l20,28.1 c-5.5,10.5-9.9,21.4-13.3,32.7l-33.2,5.6c-14.3,2.4-24.7,14.7-24.7,29.2v42.1c0,14.5,10.4,26.8,24.7,29.2l34,5.8 c3.5,11.2,8.1,22.1,13.7,32.5l-19.7,27.4c-8.4,11.8-7.1,27.9,3.2,38.1l29.8,29.8c5.6,5.6,13,8.7,20.9,8.7c6.2,0,12.1-1.9,17.1-5.5 l28.1-20c10.1,5.3,20.7,9.6,31.6,13l5.6,33.6c2.4,14.3,14.7,24.7,29.2,24.7h42.2c14.5,0,26.8-10.4,29.2-24.7l5.7-33.6 c11.3-3.5,22.2-8,32.6-13.5l27.7,19.8c5,3.6,11,5.5,17.2,5.5l0,0c7.9,0,15.3-3.1,20.9-8.7l29.8-29.8c10.2-10.2,11.6-26.3,3.2-38.1 l-19.8-27.8c5.5-10.5,10.1-21.4,13.5-32.6l33.6-5.6c14.3-2.4,24.7-14.7,24.7-29.2v-42.1 C478.9,203.801,468.5,191.501,454.2,189.101z M451.9,260.401c0,1.3-0.9,2.4-2.2,2.6l-42,7c-5.3,0.9-9.5,4.8-10.8,9.9 c-3.8,14.7-9.6,28.8-17.4,41.9c-2.7,4.6-2.5,10.3,0.6,14.7l24.7,34.8c0.7,1,0.6,2.5-0.3,3.4l-29.8,29.8c-0.7,0.7-1.4,0.8-1.9,0.8 c-0.6,0-1.1-0.2-1.5-0.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-0.6c-13.1,7.8-27.2,13.6-41.9,17.4c-5.2,1.3-9.1,5.6-9.9,10.8l-7.1,42 c-0.2,1.3-1.3,2.2-2.6,2.2h-42.1c-1.3,0-2.4-0.9-2.6-2.2l-7-42c-0.9-5.3-4.8-9.5-9.9-10.8c-14.3-3.7-28.1-9.4-41-16.8 c-2.1-1.2-4.5-1.8-6.8-1.8c-2.7,0-5.5,0.8-7.8,2.5l-35,24.9c-0.5,0.3-1,0.5-1.5,0.5c-0.4,0-1.2-0.1-1.9-0.8l-29.8-29.8 c-0.9-0.9-1-2.3-0.3-3.4l24.6-34.5c3.1-4.4,3.3-10.2,0.6-14.8c-7.8-13-13.8-27.1-17.6-41.8c-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2 c-1.3-0.2-2.2-1.3-2.2-2.6v-42.1c0-1.3,0.9-2.4,2.2-2.6l41.7-7c5.3-0.9,9.6-4.8,10.9-10c3.7-14.7,9.4-28.9,17.1-42 c2.7-4.6,2.4-10.3-0.7-14.6l-24.9-35c-0.7-1-0.6-2.5,0.3-3.4l29.8-29.8c0.7-0.7,1.4-0.8,1.9-0.8c0.6,0,1.1,0.2,1.5,0.5l34.5,24.6 c4.4,3.1,10.2,3.3,14.8,0.6c13-7.8,27.1-13.8,41.8-17.6c5.1-1.4,9-5.6,9.9-10.8l7.2-42.3c0.2-1.3,1.3-2.2,2.6-2.2h42.1 c1.3,0,2.4,0.9,2.6,2.2l7,41.7c0.9,5.3,4.8,9.6,10,10.9c15.1,3.8,29.5,9.7,42.9,17.6c4.6,2.7,10.3,2.5,14.7-0.6l34.5-24.8 c0.5-0.3,1-0.5,1.5-0.5c0.4,0,1.2,0.1,1.9,0.8l29.8,29.8c0.9,0.9,1,2.3,0.3,3.4l-24.7,34.7c-3.1,4.3-3.3,10.1-0.6,14.7 c7.8,13.1,13.6,27.2,17.4,41.9c1.3,5.2,5.6,9.1,10.8,9.9l42,7.1c1.3,0.2,2.2,1.3,2.2,2.6v42.1H451.9z"/> <path d="M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001 z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z"/> </g></svg>
          </foreignObject>
          {listRect}
        </g>
      )
    })
    return polygons
  }

  generateRectangles(){
    let rectangles = this.state.listRectangle.map((obj, index) => {
      const listRect = this.generateRectPoint(obj)
      const arrayPoint = obj.coordinates.map((objPolygon, polygonIndex) => {
        return `${objPolygon.x},${objPolygon.y}`
      })
      const points = arrayPoint.join(' ')
      const rectangleClassName = this.state.rectangleIsDrawing && index === this.state.listRectangle.length - 1 ? 'rectangle drawing' : 'rectangle'
      var gClassName = this.state.rectangleIsDrawing && index === this.state.listRectangle.length - 1 ? 'drawing' : '';
      gClassName += this.state.rectangleHighlighted[index]  ? ' hover-on' : '';
      let coordinates = `${points}`
      if(this.state.rectangleDraggingPosition !== undefined && index === this.state.listRectangle.length - 1){
        coordinates += ` ${this.state.rectangleDraggingPosition}`
      }

      var objectHeight = ( 90 / document.querySelector(".image-stage-container div").offsetHeight ) * this.state.imageHeigth

      var objectWidth = ( 24 / document.querySelector(".image-stage-container div").offsetWidth ) * this.state.imageWidth

      var rectX = obj.coordinates[0].x

      var rectY = obj.coordinates[0].y

      if( obj.coordinates[1] ) {

        if( obj.coordinates[1].x > obj.coordinates[0].x ) {

          var rectWidth = obj.coordinates[1].x - obj.coordinates[0].x

        } else {

          var rectWidth = obj.coordinates[0].x - obj.coordinates[1].x

          rectX = obj.coordinates[0].x - rectWidth

        }

        if( obj.coordinates[1].y > obj.coordinates[0].y ) {

          var rectHeight = obj.coordinates[1].y - obj.coordinates[0].y

        } else {

          var rectHeight = obj.coordinates[0].y - obj.coordinates[1].y

          rectY = obj.coordinates[0].y - rectHeight

        }

      }

      return (
        <g key={index} className={gClassName} onMouseOver={(e) => this.showElements(e, index, 'rectangle')} onMouseOut={(e) => this.hideElements(e, index, 'rectangle')}>
          <rect className={rectangleClassName}  x={rectX} y={rectY} width={rectWidth} height={rectHeight}></rect>            
          <foreignObject x={obj.coordinates[0].x} y={obj.coordinates[0].y}  style={{ height: objectHeight, width: objectWidth }}>
              <svg className="remove" viewBox="0 0 475.2 475.2" onClick={() => this.handleRemoveListImageMap(index, 'rectangle')}><g><path d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1    l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4    c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"></path></g></svg>
              <svg className="settings" viewBox="0 0 475.2 475.2" onClick={() => this.openDetailsPopup(index, 'rectangle')}><g> <path d="M454.2,189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8,7.1-27.9-3.2-38.1l-29.8-29.8 c-5.6-5.6-13-8.7-20.9-8.7c-6.2,0-12.1,1.9-17.1,5.5l-27.8,19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2 c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5,0-26.8,10.4-29.2,24.7l-5.8,34c-11.2,3.5-22.1,8.1-32.5,13.7l-27.5-19.8 c-5-3.6-11-5.5-17.2-5.5c-7.9,0-15.4,3.1-20.9,8.7l-29.9,29.8c-10.2,10.2-11.6,26.3-3.2,38.1l20,28.1 c-5.5,10.5-9.9,21.4-13.3,32.7l-33.2,5.6c-14.3,2.4-24.7,14.7-24.7,29.2v42.1c0,14.5,10.4,26.8,24.7,29.2l34,5.8 c3.5,11.2,8.1,22.1,13.7,32.5l-19.7,27.4c-8.4,11.8-7.1,27.9,3.2,38.1l29.8,29.8c5.6,5.6,13,8.7,20.9,8.7c6.2,0,12.1-1.9,17.1-5.5 l28.1-20c10.1,5.3,20.7,9.6,31.6,13l5.6,33.6c2.4,14.3,14.7,24.7,29.2,24.7h42.2c14.5,0,26.8-10.4,29.2-24.7l5.7-33.6 c11.3-3.5,22.2-8,32.6-13.5l27.7,19.8c5,3.6,11,5.5,17.2,5.5l0,0c7.9,0,15.3-3.1,20.9-8.7l29.8-29.8c10.2-10.2,11.6-26.3,3.2-38.1 l-19.8-27.8c5.5-10.5,10.1-21.4,13.5-32.6l33.6-5.6c14.3-2.4,24.7-14.7,24.7-29.2v-42.1 C478.9,203.801,468.5,191.501,454.2,189.101z M451.9,260.401c0,1.3-0.9,2.4-2.2,2.6l-42,7c-5.3,0.9-9.5,4.8-10.8,9.9 c-3.8,14.7-9.6,28.8-17.4,41.9c-2.7,4.6-2.5,10.3,0.6,14.7l24.7,34.8c0.7,1,0.6,2.5-0.3,3.4l-29.8,29.8c-0.7,0.7-1.4,0.8-1.9,0.8 c-0.6,0-1.1-0.2-1.5-0.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-0.6c-13.1,7.8-27.2,13.6-41.9,17.4c-5.2,1.3-9.1,5.6-9.9,10.8l-7.1,42 c-0.2,1.3-1.3,2.2-2.6,2.2h-42.1c-1.3,0-2.4-0.9-2.6-2.2l-7-42c-0.9-5.3-4.8-9.5-9.9-10.8c-14.3-3.7-28.1-9.4-41-16.8 c-2.1-1.2-4.5-1.8-6.8-1.8c-2.7,0-5.5,0.8-7.8,2.5l-35,24.9c-0.5,0.3-1,0.5-1.5,0.5c-0.4,0-1.2-0.1-1.9-0.8l-29.8-29.8 c-0.9-0.9-1-2.3-0.3-3.4l24.6-34.5c3.1-4.4,3.3-10.2,0.6-14.8c-7.8-13-13.8-27.1-17.6-41.8c-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2 c-1.3-0.2-2.2-1.3-2.2-2.6v-42.1c0-1.3,0.9-2.4,2.2-2.6l41.7-7c5.3-0.9,9.6-4.8,10.9-10c3.7-14.7,9.4-28.9,17.1-42 c2.7-4.6,2.4-10.3-0.7-14.6l-24.9-35c-0.7-1-0.6-2.5,0.3-3.4l29.8-29.8c0.7-0.7,1.4-0.8,1.9-0.8c0.6,0,1.1,0.2,1.5,0.5l34.5,24.6 c4.4,3.1,10.2,3.3,14.8,0.6c13-7.8,27.1-13.8,41.8-17.6c5.1-1.4,9-5.6,9.9-10.8l7.2-42.3c0.2-1.3,1.3-2.2,2.6-2.2h42.1 c1.3,0,2.4,0.9,2.6,2.2l7,41.7c0.9,5.3,4.8,9.6,10,10.9c15.1,3.8,29.5,9.7,42.9,17.6c4.6,2.7,10.3,2.5,14.7-0.6l34.5-24.8 c0.5-0.3,1-0.5,1.5-0.5c0.4,0,1.2,0.1,1.9,0.8l29.8,29.8c0.9,0.9,1,2.3,0.3,3.4l-24.7,34.7c-3.1,4.3-3.3,10.1-0.6,14.7 c7.8,13.1,13.6,27.2,17.4,41.9c1.3,5.2,5.6,9.1,10.8,9.9l42,7.1c1.3,0.2,2.2,1.3,2.2,2.6v42.1H451.9z"/> <path d="M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001 z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z"/> </g></svg>
          </foreignObject>
          {listRect}
        </g>
      )
    })
    return rectangles
  }

  generateCircle(){
    let circles = this.state.listCircle.map((obj, index) => {
      const listRect = this.generateRectPoint(obj)
      const arrayPoint = obj.coordinates.map((objPolygon, polygonIndex) => {
        return `${objPolygon.x},${objPolygon.y}`
      })
      const points = arrayPoint.join(' ')
      const rectangleClassName = this.state.circleIsDrawing && index === this.state.listCircle.length - 1 ? 'Circle drawing' : 'Circle'
      var gClassName = this.state.circleIsDrawing && index === this.state.listCircle.length - 1 ? 'drawing' : '';
      gClassName += this.state.circleHighlighted[index]  ? ' hover-on' : '';
      let coordinates = `${points}`
      if(this.state.circleDraggingPosition !== undefined && index === this.state.listCircle.length - 1){
        coordinates += ` ${this.state.circleDraggingPosition}`
      }

      var objectHeight = ( 90 / document.querySelector(".image-stage-container div").offsetHeight ) * this.state.imageHeigth

      var objectWidth = ( 24 / document.querySelector(".image-stage-container div").offsetWidth ) * this.state.imageWidth

      if( obj.coordinates[1] ) {

        if( obj.coordinates[1].x > obj.coordinates[0].x ) {

          var rectWidth = obj.coordinates[1].x - obj.coordinates[0].x

        } else {

          var rectWidth = obj.coordinates[0].x - obj.coordinates[1].x

        }

        if( obj.coordinates[1].y > obj.coordinates[0].y ) {

          var rectHeight = obj.coordinates[1].y - obj.coordinates[0].y

        } else {

          var rectHeight = obj.coordinates[0].y - obj.coordinates[1].y

        }

        var a = rectWidth

        var b = rectHeight      

        var c = Math.sqrt( (a * a) + (b * b) )
      
      }

      return (
        <g key={index} className={gClassName} onMouseOver={(e) => this.showElements(e, index, 'circle')} onMouseOut={(e) => this.hideElements(e, index, 'circle')}>
          <circle cx={obj.coordinates[0].x} cy={obj.coordinates[0].y} r={c} className={rectangleClassName}></circle>         
          <foreignObject x={obj.coordinates[0].x} y={obj.coordinates[0].y}  style={{ height: objectHeight, width: objectWidth }}>
              <svg className="remove" viewBox="0 0 475.2 475.2" onClick={() => this.handleRemoveListImageMap(index, 'circle')}><g><path d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1    l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4    c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"></path></g></svg>
              <svg className="settings" viewBox="0 0 475.2 475.2" onClick={() => this.openDetailsPopup(index, 'circle')}><g> <path d="M454.2,189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8,7.1-27.9-3.2-38.1l-29.8-29.8 c-5.6-5.6-13-8.7-20.9-8.7c-6.2,0-12.1,1.9-17.1,5.5l-27.8,19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2 c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5,0-26.8,10.4-29.2,24.7l-5.8,34c-11.2,3.5-22.1,8.1-32.5,13.7l-27.5-19.8 c-5-3.6-11-5.5-17.2-5.5c-7.9,0-15.4,3.1-20.9,8.7l-29.9,29.8c-10.2,10.2-11.6,26.3-3.2,38.1l20,28.1 c-5.5,10.5-9.9,21.4-13.3,32.7l-33.2,5.6c-14.3,2.4-24.7,14.7-24.7,29.2v42.1c0,14.5,10.4,26.8,24.7,29.2l34,5.8 c3.5,11.2,8.1,22.1,13.7,32.5l-19.7,27.4c-8.4,11.8-7.1,27.9,3.2,38.1l29.8,29.8c5.6,5.6,13,8.7,20.9,8.7c6.2,0,12.1-1.9,17.1-5.5 l28.1-20c10.1,5.3,20.7,9.6,31.6,13l5.6,33.6c2.4,14.3,14.7,24.7,29.2,24.7h42.2c14.5,0,26.8-10.4,29.2-24.7l5.7-33.6 c11.3-3.5,22.2-8,32.6-13.5l27.7,19.8c5,3.6,11,5.5,17.2,5.5l0,0c7.9,0,15.3-3.1,20.9-8.7l29.8-29.8c10.2-10.2,11.6-26.3,3.2-38.1 l-19.8-27.8c5.5-10.5,10.1-21.4,13.5-32.6l33.6-5.6c14.3-2.4,24.7-14.7,24.7-29.2v-42.1 C478.9,203.801,468.5,191.501,454.2,189.101z M451.9,260.401c0,1.3-0.9,2.4-2.2,2.6l-42,7c-5.3,0.9-9.5,4.8-10.8,9.9 c-3.8,14.7-9.6,28.8-17.4,41.9c-2.7,4.6-2.5,10.3,0.6,14.7l24.7,34.8c0.7,1,0.6,2.5-0.3,3.4l-29.8,29.8c-0.7,0.7-1.4,0.8-1.9,0.8 c-0.6,0-1.1-0.2-1.5-0.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-0.6c-13.1,7.8-27.2,13.6-41.9,17.4c-5.2,1.3-9.1,5.6-9.9,10.8l-7.1,42 c-0.2,1.3-1.3,2.2-2.6,2.2h-42.1c-1.3,0-2.4-0.9-2.6-2.2l-7-42c-0.9-5.3-4.8-9.5-9.9-10.8c-14.3-3.7-28.1-9.4-41-16.8 c-2.1-1.2-4.5-1.8-6.8-1.8c-2.7,0-5.5,0.8-7.8,2.5l-35,24.9c-0.5,0.3-1,0.5-1.5,0.5c-0.4,0-1.2-0.1-1.9-0.8l-29.8-29.8 c-0.9-0.9-1-2.3-0.3-3.4l24.6-34.5c3.1-4.4,3.3-10.2,0.6-14.8c-7.8-13-13.8-27.1-17.6-41.8c-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2 c-1.3-0.2-2.2-1.3-2.2-2.6v-42.1c0-1.3,0.9-2.4,2.2-2.6l41.7-7c5.3-0.9,9.6-4.8,10.9-10c3.7-14.7,9.4-28.9,17.1-42 c2.7-4.6,2.4-10.3-0.7-14.6l-24.9-35c-0.7-1-0.6-2.5,0.3-3.4l29.8-29.8c0.7-0.7,1.4-0.8,1.9-0.8c0.6,0,1.1,0.2,1.5,0.5l34.5,24.6 c4.4,3.1,10.2,3.3,14.8,0.6c13-7.8,27.1-13.8,41.8-17.6c5.1-1.4,9-5.6,9.9-10.8l7.2-42.3c0.2-1.3,1.3-2.2,2.6-2.2h42.1 c1.3,0,2.4,0.9,2.6,2.2l7,41.7c0.9,5.3,4.8,9.6,10,10.9c15.1,3.8,29.5,9.7,42.9,17.6c4.6,2.7,10.3,2.5,14.7-0.6l34.5-24.8 c0.5-0.3,1-0.5,1.5-0.5c0.4,0,1.2,0.1,1.9,0.8l29.8,29.8c0.9,0.9,1,2.3,0.3,3.4l-24.7,34.7c-3.1,4.3-3.3,10.1-0.6,14.7 c7.8,13.1,13.6,27.2,17.4,41.9c1.3,5.2,5.6,9.1,10.8,9.9l42,7.1c1.3,0.2,2.2,1.3,2.2,2.6v42.1H451.9z"/> <path d="M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001 z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z"/> </g></svg>
          </foreignObject>
          {listRect}
        </g>
      )
    })
    return circles
  }

  showElements(e, index, elementType){
    if( elementType == 'polygon' ) {
      let a = this.state.polygonHighlighted.slice();
      a[index] = true;
      this.setState({polygonHighlighted: a});
      this.setState({hoverOn: true});
    } else if( elementType == 'rectangle' ) {
      let a = this.state.rectangleHighlighted.slice();
      a[index] = true;
      this.setState({rectangleHighlighted: a});
      this.setState({hoverOn: true});
    } else if( elementType == 'circle' ) {
      let a = this.state.circleHighlighted.slice();
      a[index] = true;
      this.setState({circleHighlighted: a});
      this.setState({hoverOn: true});
    }
  }

  hideElements(e, index, elementType){
    if( elementType == 'polygon' ) {    
      let a = this.state.polygonHighlighted.slice();
      a[index] = false;
      this.setState({polygonHighlighted: a});
      this.setState({hoverOn: false});
    } else if( elementType == 'rectangle' ) {    
      let a = this.state.rectangleHighlighted.slice();
      a[index] = false;
      this.setState({rectangleHighlighted: a});
      this.setState({hoverOn: false});
    } else if( elementType == 'circle' ) {    
      let a = this.state.circleHighlighted.slice();
      a[index] = false;
      this.setState({circleHighlighted: a});
      this.setState({hoverOn: false});
    }
  }

  openDetailsPopup(index, elementType){
    this.setState({
      showDetailsPopup: true,
      popupElementType: elementType
    });
    var currentListPolygon = ''
    if( elementType == "polygon" ) {
      currentListPolygon = this.state.listPolygon[index]
      this.setState({ polygonCurrentPopup: index });
      if( currentListPolygon && currentListPolygon.linkData != undefined ) {      
        this.setState({ link: currentListPolygon.linkData['link']});
        this.setState({ LinkText: currentListPolygon.linkData['LinkText']});
        this.setState({ LinkTarget: currentListPolygon.linkData['LinkTarget']});
        this.setState({ productSKU: currentListPolygon.linkData['productSKU']});
        this.setState({ productName: currentListPolygon.linkData['productName']});
      } else {     
        this.setState({ link: ""});
        this.setState({ LinkText: ""});
        this.setState({ LinkTarget: ""});
        this.setState({ productSKU: ""});
        this.setState({ productName: ""});
      }
    } else if( elementType == "rectangle" ) {
      currentListPolygon = this.state.listRectangle[index]
      this.setState({ rectancleCurrentPopup: index });
      if( currentListPolygon && currentListPolygon.linkData != undefined ) {      
        this.setState({ link: currentListPolygon.linkData['link']});
        this.setState({ LinkText: currentListPolygon.linkData['LinkText']});
        this.setState({ LinkTarget: currentListPolygon.linkData['LinkTarget']});
        this.setState({ productSKU: currentListPolygon.linkData['productSKU']});
        this.setState({ productName: currentListPolygon.linkData['productName']});
      } else {     
        this.setState({ link: ""});
        this.setState({ LinkText: ""});
        this.setState({ LinkTarget: ""});
        this.setState({ productSKU: ""});
        this.setState({ productName: ""});
      }
    } else if( elementType == "circle" ) {
      currentListPolygon = this.state.listCircle[index]
      this.setState({ circleCurrentPopup: index });
      if( currentListPolygon && currentListPolygon.linkData != undefined ) {      
        this.setState({ link: currentListPolygon.linkData['link']});
        this.setState({ LinkText: currentListPolygon.linkData['LinkText']});
        this.setState({ LinkTarget: currentListPolygon.linkData['LinkTarget']});
        this.setState({ productSKU: currentListPolygon.linkData['productSKU']});
        this.setState({ productName: currentListPolygon.linkData['productName']});
      } else {     
        this.setState({ link: ""});
        this.setState({ LinkText: ""});
        this.setState({ LinkTarget: ""});
        this.setState({ productSKU: ""});
        this.setState({ productName: ""});
      }
    }
  }

  closeDetailsPopup(){
    this.setState({ 'listPolygonLink': [] });
    this.setState({ 'listRectangleLink': [] });
    this.setState({ 'listCircleLink': [] });
    this.setState({showDetailsPopup: false});
  }

  setLinkData(type, value) {

    if( this.state.popupElementType == "polygon"  ) {
      var loadData = ''
      if( this.state.pdfLoaded == true ) {
        loadData = this.state.prevPdfPolygonData[this.state.currentImageIndex]
      } else {
        loadData = this.state.listPolygon
      }
      var listPolygonData = loadData;
      var currentIndex  = this.state.polygonCurrentPopup;
      if( listPolygonData[currentIndex]["linkData"] ) {
        listPolygonData[currentIndex]["linkData"][type] = value
      } else {
        var linkData = this.state.listPolygonLink;
        linkData[type] = value;
        this.setState({ 'listPolygonLink': linkData });
        listPolygonData[currentIndex]["linkData"] = linkData
      }
      this.setState({ 'listPolygon': listPolygonData });
    } else if( this.state.popupElementType == "rectangle"  ) {
      var loadData = ''
      if( this.state.pdfLoaded == true ) {
        loadData = this.state.prevPdfRectangleData[this.state.currentImageIndex]
      } else {
        loadData = this.state.listRectangle
      }
      var listRectangleData = loadData;
      var currentIndex  = this.state.rectancleCurrentPopup;
      if( listRectangleData[currentIndex]["linkData"] ) {
        listRectangleData[currentIndex]["linkData"][type] = value
      } else {
        var linkData = this.state.listRectangleLink;
        linkData[type] = value;
        this.setState({ 'listRectangleLink': linkData });
        listRectangleData[currentIndex]["linkData"] = linkData
      }
      this.setState({ 'listRectangle': listRectangleData });
    } else if( this.state.popupElementType == "circle"  ) {
      var loadData = ''
      if( this.state.pdfLoaded == true ) {
        loadData = this.state.prevPdfCircleData[this.state.currentImageIndex]
      } else {
        loadData = this.state.listCircle
      }
      var listRectangleData = loadData;
      var currentIndex  = this.state.circleCurrentPopup;
      if( listRectangleData[currentIndex]["linkData"] ) {
        listRectangleData[currentIndex]["linkData"][type] = value
      } else {
        var linkData = this.state.listCircleLink;
        linkData[type] = value;
        this.setState({ 'listCircleLink': linkData });
        listRectangleData[currentIndex]["linkData"] = linkData
      }
      this.setState({ 'listCircle': listRectangleData });
    }
  }

  getLink = link => event => {
    this.setState({ 'link': event.target.value })
    this.setLinkData('link', event.target.value )
  };   
  
  getLinkText = LinkText => event => {
    this.setState({ 'LinkText': event.target.value })
    this.setLinkData('LinkText', event.target.value )
  };

  getLinkTarget = (event, index, value) => {
    this.setState({ 'LinkTarget': value })
    this.setLinkData('LinkTarget', value )
  };

  getProductSKU = productSKU => event => {
    this.setState({ 'productSKU': event.target.value })
    this.setLinkData('productSKU', event.target.value )
  }; 
  
  getProductName = productName => event => {
    this.setState({ 'productName': event.target.value })
    this.setLinkData('productName', event.target.value )
  }; 

  getDetailsPopup() {
    let output = null
    if(this.state.showDetailsPopup){
      output = (
        <Modal open={true} onClose={() => this.closeDetailsPopup()}>
          <TextField
            id="imgLinkText"
            floatingLabelText="Title"
            value={this.state.LinkText}
            onChange={this.getLinkText("LinkText")}
          />
          <TextField
            id="imgLink"
            floatingLabelText="Link"
            value={this.state.link}
            onChange={this.getLink("imgLink")}
          />
          <TextField
            id="productSKU"
            floatingLabelText="Product SKU"
            value={this.state.productSKU}
            onChange={this.getProductSKU("productSKU")}
          />
          <TextField
            id="productName"
            floatingLabelText="Product Name"
            value={this.state.productName}
            onChange={this.getProductName("productName")}
          />
          <SelectField
            floatingLabelText="Link Target"
            value={this.state.LinkTarget}
            onChange={this.getLinkTarget}
          >
            <MenuItem value={"_blank"} primaryText="New Window" />
            <MenuItem value={'_parent'} primaryText="Parent Frame" />
            <MenuItem value={'_self'} primaryText="Self Frame" />
            <MenuItem value={'_top'} primaryText="Full Body" />
          </SelectField>
          
        </Modal>
      )
    }
    return output
  }
  
  addRectOnImage(e){
    
    var currWidth = document.querySelector(".image-stage-container div").offsetWidth

    var currHeight = document.querySelector(".image-stage-container div").offsetHeight

    var imgStart = document.querySelector("img.main-image").getBoundingClientRect()

    var imgStartX = imgStart.x

    var imgStartY = imgStart.y

    var currentHeightPercentage = ( (  e.clientY - imgStartY  ) / (currHeight) )

    var currentWidthPercentage = ( (  e.clientX - imgStartX  ) / (currWidth) )

    var offsetYValu = ( currentHeightPercentage ) * this.state.imageHeigth

    var offsetXValu = ( currentWidthPercentage ) * this.state.imageWidth

    if( this.state.value == "polygon"  ) {

      if(this.state.polygonIsDrawing){

        if( this.state.pdfLoaded == true ) {

          var polygonData = this.state.prevPdfPolygonData

          var currentImageIndex = this.state.currentImageIndex

          polygonData[currentImageIndex] = this.state.listPolygon
          let prevPolygonData = polygonData[currentImageIndex][polygonData[currentImageIndex].length - 1]

          prevPolygonData.coordinates.push({x: offsetXValu, y: offsetYValu})
          polygonData[currentImageIndex][polygonData[currentImageIndex].length - 1] = prevPolygonData
          
          this.setState({
            pdfTempPolygon: polygonData,
            prevPdfPolygonData: polygonData,
            listPolygon: polygonData[currentImageIndex]
          })

        }

        const tempListPolygon = this.state.listPolygon
        let lastPolygon = tempListPolygon[tempListPolygon.length - 1]
        lastPolygon.coordinates.push({x: offsetXValu, y: offsetYValu})
        tempListPolygon[tempListPolygon.length - 1] = lastPolygon
        this.setState({
          listPolygon: tempListPolygon,
        })
      }
      else if(!this.state.hoverOn) {
        const tempListPolygon = this.state.listPolygon
        tempListPolygon.push({
          coordinates: [{x: offsetXValu, y: offsetYValu}]
        })

        this.setState({
          polygonIsDrawing: true,
          listPolygon: tempListPolygon
        })
      }
    } else if( this.state.value == "rectangle" ) {

      if(this.state.rectangleIsDrawing){

        if( this.state.pdfLoaded == true ) {
          var RectangleData = this.state.prevPdfRectangleData
          var currentImageIndex = this.state.currentImageIndex

          RectangleData[currentImageIndex] = this.state.listRectangle
          let prevRectangleData = RectangleData[currentImageIndex][RectangleData[currentImageIndex].length - 1]
          if( prevRectangleData.coordinates.length <= 2 ) {
            this.stopRectangleDrawing()
          }
          prevRectangleData.coordinates.push({x: offsetXValu, y: offsetYValu})
          RectangleData[currentImageIndex][RectangleData[currentImageIndex].length - 1] = prevRectangleData
          
          this.setState({
            pdfTempRectangle: RectangleData,
            prevPdfRectangleData: RectangleData,
            listRectangle: RectangleData[currentImageIndex]
          })
        }

        const tempListRectangle = this.state.listRectangle
        let lastRectangle = tempListRectangle[tempListRectangle.length - 1]
        if( lastRectangle.coordinates.length <= 2 ) {
          this.stopRectangleDrawing()
        }
        lastRectangle.coordinates.push({x: offsetXValu, y: offsetYValu})
        tempListRectangle[tempListRectangle.length - 1] = lastRectangle
        this.setState({
          listRectangle: tempListRectangle,
        })

      }
      else if(!this.state.hoverOn) {
        const tempListRectangle = this.state.listRectangle
        tempListRectangle.push({
          coordinates: [{x: offsetXValu, y: offsetYValu}]
        })

        this.setState({
          rectangleIsDrawing: true,
          listRectangle: tempListRectangle
        })
      }

    } else if( this.state.value == "circle" ) {

      if(this.state.circleIsDrawing){

        if( this.state.pdfLoaded == true ) {
          var RectangleData = this.state.prevPdfCircleData
          var currentImageIndex = this.state.currentImageIndex

          RectangleData[currentImageIndex] = this.state.listCircle
          let prevRectangleData = RectangleData[currentImageIndex][RectangleData[currentImageIndex].length - 1]
          if( prevRectangleData.coordinates.length <= 2 ) {
            this.stopRectangleDrawing()
          }
          prevRectangleData.coordinates.push({x: offsetXValu, y: offsetYValu})
          RectangleData[currentImageIndex][RectangleData[currentImageIndex].length - 1] = prevRectangleData
          
          this.setState({
            pdfTempCircle: RectangleData,
            prevPdfCircleData: RectangleData,
            listCircle: RectangleData[currentImageIndex]
          })
        }

        const tempListRectangle = this.state.listCircle
        let lastRectangle = tempListRectangle[tempListRectangle.length - 1]
        if( lastRectangle.coordinates.length <= 2 ) {
          this.stopRectangleDrawing()
        }
        lastRectangle.coordinates.push({x: offsetXValu, y: offsetYValu})
        tempListRectangle[tempListRectangle.length - 1] = lastRectangle
        this.setState({
          listCircle: tempListRectangle,
        })

      }
      else if(!this.state.hoverOn) {
        const tempListRectangle = this.state.listCircle
        tempListRectangle.push({
          coordinates: [{x: offsetXValu, y: offsetYValu}]
        })

        this.setState({
          circleIsDrawing: true,
          listCircle: tempListRectangle
        })
      }

    }
  }

  handleMouseMove(e){
    
    var currWidth = document.querySelector(".image-stage-container div").offsetWidth

    var currHeight = document.querySelector(".image-stage-container div").offsetHeight

    var imgStart = document.querySelector("img.main-image").getBoundingClientRect()

    var imgStartX = imgStart.x

    var imgStartY = imgStart.y

    var currentHeightPercentage = ( ( e.clientY - imgStartY ) / (currHeight) )

    var currentWidthPercentage = ( ( e.clientX - imgStartX ) / (currWidth) )

    var offsetYValu = ( currentHeightPercentage ) * this.state.imageHeigth

    var offsetXValu = ( currentWidthPercentage ) * this.state.imageWidth 

    if(this.state.polygonIsDrawing){
      this.setState({
        polygonDraggingPosition: `${offsetXValu},${offsetYValu}`
      })

    } else if( this.state.polygonIsDrawing ) {     
      this.setState({
        rectangleDraggingPosition: `${offsetXValu},${offsetYValu}`
      })
    } else if( this.state.circleIsDrawing ) {     
      this.setState({
        circleDraggingPosition: `${offsetXValu},${offsetYValu}`
      })
    }
  }

  removeAllImageMap(){
    const tempListPolygon = []
    this.setState({
      listPolygon: tempListPolygon
    })
    this.setState({hoverOn: false});
  }

  handleRemoveListImageMap(removeIndex, elementType){

    if( elementType == "polygon" ) {

      const tempListPolygon = this.state.listPolygon.filter((objPolygon, index) => removeIndex !== index)

      if( this.state.pdfLoaded == true ) {

        var tempPdfPrevData = this.state.prevPdfPolygonData[this.state.currentImageIndex].filter((objPolygon, index) => removeIndex !== index)

        var tempData = this.state.prevPdfPolygonData
        
        tempData[this.state.currentImageIndex] = tempPdfPrevData
      
      }

      this.setState({
        listPolygon: tempListPolygon,
        prevPdfPolygonData: tempData
      })
      this.setState({hoverOn: false});
    
    } else if( elementType == "rectangle" ) {

      const tempListRectangle = this.state.listRectangle.filter((objPolygon, index) => removeIndex !== index)

      if( this.state.pdfLoaded == true ) {

        var tempPdfPrevData = this.state.prevPdfRectangleData[this.state.currentImageIndex].filter((objPolygon, index) => removeIndex !== index)

        var tempData = this.state.prevPdfRectangleData
        
        tempData[this.state.currentImageIndex] = tempPdfPrevData
      
      }

      this.setState({
        listRectangle: tempListRectangle,
        prevPdfRectangleData: tempData
      })
      this.setState({hoverOn: false});
    
    } else if( elementType == "circle" ) {

      const tempListRectangle = this.state.listCircle.filter((objPolygon, index) => removeIndex !== index)

      if( this.state.pdfLoaded == true ) {

        var tempPdfPrevData = this.state.prevPdfCircleData[this.state.currentImageIndex].filter((objPolygon, index) => removeIndex !== index)

        var tempData = this.state.prevPdfCircleData
        
        tempData[this.state.currentImageIndex] = tempPdfPrevData
      
      }

      this.setState({
        listCircle: tempListRectangle,
        prevPdfCircleData: tempData
      })
      this.setState({hoverOn: false});
    
    }

  }

  getListImageMap(){
    let listMap = null
    if(this.state.listPolygon.length > 0){
      listMap = this.state.prevPdfPolygonData[this.state.currentImageIndex].map((objPolygon, index) => {
        const arrayPoint = objPolygon.coordinates.map((objPolygon, polygonIndex) => {
          return `${objPolygon.x},${objPolygon.y}`
        })
        const coordinatesPoint = arrayPoint.join(' ')
        return (
          <TableRow key={index}>
            <TableRowColumn>
              {coordinatesPoint}
            </TableRowColumn>
            <TableRowColumn>
              <div className="list-image-map-remove-container">
                <span onClick={() => this.handleRemoveListImageMap(index)}><RemoveIcon /></span>
              </div>
            </TableRowColumn>
          </TableRow>
        )
      })
      listMap = (
        <div className="list-image-map-container">
          <Paper zDepth={3}>
            <Table className="table-list-image-map">
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Coordinates</TableHeaderColumn>
                  <TableHeaderColumn>Remove</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listMap}
              </TableBody>
            </Table>
          </Paper>
        </div>
      )
    }
    return listMap
  }

  getheader(){
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true}>
          <div className="header-title">
            Image Map Generator
          </div>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarTitle text="Shape" />
          <ToolbarSeparator />
          <DropDownMenu value={this.state.value} onChange={this.handleChange}>
            <MenuItem value={"polygon"} primaryText="Polygon" />
            <MenuItem value={'circle'} primaryText="Circle" />
            <MenuItem value={'rectangle'} primaryText="Rectangle" />
          </DropDownMenu>
          <ToolbarSeparator />
          <RaisedButton label="Get Coordinate" primary={true} onClick={() => this.getResultModal()}/>
        </ToolbarGroup>
      </Toolbar>
    )
  }

  getResultModal(){
    let code = ''
    var mapAndCode = ''
      var imageUrl = ''
      var imageHeigth = ''
      var imageWidth = ''
      if( this.state.imagePreviewUrl != undefined ) { imageUrl = `${this.state.imagePreviewUrl}` }
      if( this.state.imageHeigth != undefined ) { imageHeigth = `${this.state.imageHeigth}px` }
      if( this.state.imageWidth != undefined ) { imageWidth = `${this.state.imageWidth}px` }
        let pdfArrayPoint = ''
        let pdfFinalOutput = ''
        if( this.state.pdfLoaded == true ) {
          
          let rectangleArrayPoint = ''
          let circleArrayPoint = ''
          pdfFinalOutput = this.state.prevPdfPolygonData.map((prevPdf, index) => {

            rectangleArrayPoint = this.state.prevPdfRectangleData[index].map((obj, index) => {
              let pdfPoints = obj.coordinates.map((objCoor) => {
                return `${objCoor.x},${objCoor.y}`
              })
              var shape = `${this.state.value}`;
              var LinkTarget = '';
              var LinkText = '';
              var productName = '';
              var link = '';
              if( obj["linkData"] ) {
                if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
                if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
                if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
                if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
              }
              pdfPoints = pdfPoints.join(' ')
              return `
                        <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${pdfPoints}" shape="rectangle">
                    `
            })
            rectangleArrayPoint = rectangleArrayPoint.join('\n')

            circleArrayPoint = this.state.prevPdfCircleData[index].map((obj, index) => {
              if( obj.coordinates[1].x > obj.coordinates[0].x ) {

                var rectWidth = obj.coordinates[1].x - obj.coordinates[0].x
      
              } else {
      
                var rectWidth = obj.coordinates[0].x - obj.coordinates[1].x
      
              }
      
              if( obj.coordinates[1].y > obj.coordinates[0].y ) {
      
                var rectHeight = obj.coordinates[1].y - obj.coordinates[0].y
      
              } else {
      
                var rectHeight = obj.coordinates[0].y - obj.coordinates[1].y
      
              }
      
              var a = rectWidth
      
              var b = rectHeight      
      
              var c = Math.sqrt( (a * a) + (b * b) )
  
              let pdfPoints = `${obj.coordinates[0].x},${obj.coordinates[0].y},${c}`
              var shape = `${this.state.value}`;
              var LinkTarget = '';
              var LinkText = '';
              var productName = '';
              var link = '';
              if( obj["linkData"] ) {
                if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
                if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
                if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
                if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
              }
              return `
                        <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${pdfPoints}" shape="circle">
                    `
            })
            circleArrayPoint = circleArrayPoint.join('\n')


            pdfArrayPoint = prevPdf.map((obj, index) => {
              let pdfPoints = obj.coordinates.map((objCoor) => {
                return `${objCoor.x},${objCoor.y}`
              })
              var shape = `${this.state.value}`;
              var LinkTarget = '';
              var LinkText = '';
              var productName = '';
              var link = '';
              if( obj["linkData"] ) {
                if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
                if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
                if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
                if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
              }
              pdfPoints = pdfPoints.join(' ')
              return `
                        <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${pdfPoints}" shape="polygon">
                    `
            })
            pdfArrayPoint = pdfArrayPoint.join('\n')
            
              return `
                <div>
                  <p>
                    <img name="usaMap" width="${imageWidth}" height="${imageHeigth}"  usemap="#map_${index}" border="0" src="${this.state.images[index]}">
                  </p>
                  <map name="map_${index}">
                    ${pdfArrayPoint}
                    ${rectangleArrayPoint}
                    ${circleArrayPoint}
                  </map>
                </div>
              `
          })
          pdfFinalOutput = pdfFinalOutput.join('\n')
          code = `
            <div id=“flipbook”>
              <div class=“hard”> Turn.js </div>
              <div class=“hard”></div><div>
                  ${pdfFinalOutput}
              <div class=“hard”></div>
              <div class=“hard”></div>
            </div>
                  `
        } else {

          let rectangleArrayPoint = ''
          let circleArrayPoint = ''

          let polygonArrayPoint = this.state.listPolygon.map((obj, index) => {

            let points = obj.coordinates.map((objCoor) => {
              return `${objCoor.x},${objCoor.y}`
            })
            var shape = `${this.state.value}`;
            var LinkTarget = '';
            var LinkText = '';
            var productName = '';
            var link = '';
            if( obj["linkData"] ) {
              if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
              if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
              if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
              if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
            }
            points = points.join(' ')
            return `
                    <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${points}" shape="polygon">
                  `
          })
          polygonArrayPoint = polygonArrayPoint.join('\n')

          rectangleArrayPoint = this.state.listRectangle.map((obj, index) => {
            let pdfPoints = obj.coordinates.map((objCoor) => {
              return `${objCoor.x},${objCoor.y}`
            })
            var shape = `${this.state.value}`;
            var LinkTarget = '';
            var LinkText = '';
            var productName = '';
            var link = '';
            if( obj["linkData"] ) {
              if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
              if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
              if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
              if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
            }
            pdfPoints = pdfPoints.join(' ')
            return `
                      <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${pdfPoints}" shape="rectangle">
                  `
          })
          rectangleArrayPoint = rectangleArrayPoint.join('\n')

          circleArrayPoint = this.state.listCircle.map((obj, index) => {
      
            if( obj.coordinates[1].x > obj.coordinates[0].x ) {

              var rectWidth = obj.coordinates[1].x - obj.coordinates[0].x
    
            } else {
    
              var rectWidth = obj.coordinates[0].x - obj.coordinates[1].x
    
            }
    
            if( obj.coordinates[1].y > obj.coordinates[0].y ) {
    
              var rectHeight = obj.coordinates[1].y - obj.coordinates[0].y
    
            } else {
    
              var rectHeight = obj.coordinates[0].y - obj.coordinates[1].y
    
            }
    
            var a = rectWidth
    
            var b = rectHeight      
    
            var c = Math.sqrt( (a * a) + (b * b) )

            let pdfPoints = `${obj.coordinates[0].x},${obj.coordinates[0].y},${c}`

            var shape = `${this.state.value}`;
            var LinkTarget = '';
            var LinkText = '';
            var productName = '';
            var link = '';
            if( obj["linkData"] ) {
              if( obj["linkData"]['LinkTarget'] != undefined ) { LinkTarget = `${obj["linkData"]['LinkTarget']}` }
              if( obj["linkData"]['LinkText'] != undefined ) { LinkText = `${obj["linkData"]['LinkText']}` }
              if( obj["linkData"]['productName'] != undefined ) { productName = `${obj["linkData"]['productName']}` }
              if( obj["linkData"]['link'] != undefined ) { link = `${obj["linkData"]['link']}` }
            }
            return `
                      <area target="${LinkTarget}" alt="${LinkText}" title="${productName}" href="${link}" coords="${pdfPoints}" shape="circle">
                  `
          })
          circleArrayPoint = circleArrayPoint.join('\n')

          code = `
            <div id=“flipbook”>
              <div class=“hard”> Turn.js </div>
              <div class=“hard”></div>
                <div>
                  <p>
                    <img name="usaMap" width="${imageWidth}" height="${imageHeigth}"  usemap="#m_usaMap" border="0" src="${imageUrl}">
                  </p>
                  <map name="m_usaMap">
                    ${polygonArrayPoint}
                    ${rectangleArrayPoint}
                    ${circleArrayPoint}
                  </map>
                </div>
              <div class=“hard”></div>
              <div class=“hard”></div>
            </div>
                  `
        }
      
    var filename = "coordinates.html"

    var element = document.createElement('a')

    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(code))

    element.setAttribute('download', filename)

    element.style.display = 'none'

    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)

  }

  render() {
    return (
      <div>
        <div className="header-container">
          {this.getheader()}
        </div>
        <div className="home-container">
          <div className="container">
            { this.getImageContainer() }
          </div>
        </div>
        {this.getDetailsPopup()}
      </div>
    )
  }
}
