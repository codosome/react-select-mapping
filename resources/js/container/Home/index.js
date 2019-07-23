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
import Modal from 'react-responsive-modal';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/htmlmixed/htmlmixed'
import RemoveIcon from 'react-icons/lib/fa/close'

import './style.scss'

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
      draggingPosition: undefined,
      isDrawing: false,
      listPolygon: [],
      highlighted: [],
      hoverOn: false,
      showDetailsPopup: false
    }
  }

  handleChange = (event, index, value) => this.setState({value});

  onDrop(files) {
    let reader = new FileReader();
    let file = files[0];
    reader.onloadend = () => {
      this.setState({
        imagePreviewUrl: reader.result
      });
    }

    reader.onload = (theFile) => {
      let image = new Image();
      image.src = theFile.target.result;
      image.onload = () => {
        this.setState({
          imageWidth: image.width,
          imageHeigth: image.height
        })
      }
    }

    reader.readAsDataURL(file)
  }

  handleGetImageFromUrl(){
    let image = new Image();
    image.src = this.state.imageUrl
    image.onload = () => {
      this.setState({
        imageWidth: image.width,
        imageHeigth: image.height,
        imagePreviewUrl: this.state.imageUrl
      })
    }
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
        <div className="drop-file-text">OR</div>
        <div className="drop-file-input-container">
          <TextField
            hintText="Image URL"
            value={this.state.imageUrl}
            onChange={(e, value) => this.handleUrlImageChanged(value)}
          />
          <div>
            <RaisedButton
              label="Get Image"
              onClick={() => this.handleGetImageFromUrl()}
             />
          </div>
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
      output = (
        <div className="image-stage-container">
          <div>
            <img src={this.state.imagePreviewUrl} width="100%" height="auto"/>
            <svg
              className="svg-container"
              onMouseDown={(e) => this.addRectOnImage(e)}
              onMouseMove={(e) => this.handleMouseMove(e)}
            >
              {this.generatePolygon()}
            </svg>
          </div>
        </div>
      )
    }
    return output
  }

  stopDrawing(e){
    e.stopPropagation()
    this.setState({
      isDrawing: false,
      draggingPosition: undefined
    })
  }

  generateRectPoint(obj) {
    let listRect = obj.coordinates.map((objRect, rectIndex) => {
      const finishDrawing = rectIndex === 0
      return (
        <circle
          className="circle"
          key={rectIndex}
          r="4"
          cx={objRect.x}
          cy={objRect.y}
          onMouseDown={(e) => this.stopDrawing(e, finishDrawing)}
        />
      )
    })
    return listRect
  }

  generatePolygon(){
    let polygons = this.state.listPolygon.map((obj, index) => {
      const listRect = this.generateRectPoint(obj)
      const arrayPoint = obj.coordinates.map((objPolygon, polygonIndex) => {
        return `${objPolygon.x},${objPolygon.y}`
      })
      const points = arrayPoint.join(' ')
      const polygonClassName = this.state.isDrawing && index === this.state.listPolygon.length - 1 ? 'polygon drawing' : 'polygon'
      var gClassName = this.state.isDrawing && index === this.state.listPolygon.length - 1 ? 'drawing' : '';
      gClassName += this.state.highlighted[index]  ? ' hover-on' : '';
      let coordinates = `${points}`
      if(this.state.draggingPosition !== undefined && index === this.state.listPolygon.length - 1){
        coordinates += ` ${this.state.draggingPosition}`
      }
      return (
        <g key={index} className={gClassName} onMouseOver={(e) => this.showElements(e, index)} onMouseOut={(e) => this.hideElements(e, index)}>
          <polygon className={polygonClassName} points={coordinates} />
          <foreignObject x={obj.coordinates[0].x} y={obj.coordinates[0].y} >
              <svg className="remove" viewBox="0 0 475.2 475.2" onClick={() => this.handleRemoveListImageMap(index)}><g><path d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1    l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4    c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"></path></g></svg>
              <svg className="settings" viewBox="0 0 475.2 475.2" onClick={() => this.openDetailsPopup(index)}><g> <path d="M454.2,189.101l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8,7.1-27.9-3.2-38.1l-29.8-29.8 c-5.6-5.6-13-8.7-20.9-8.7c-6.2,0-12.1,1.9-17.1,5.5l-27.8,19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2 c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5,0-26.8,10.4-29.2,24.7l-5.8,34c-11.2,3.5-22.1,8.1-32.5,13.7l-27.5-19.8 c-5-3.6-11-5.5-17.2-5.5c-7.9,0-15.4,3.1-20.9,8.7l-29.9,29.8c-10.2,10.2-11.6,26.3-3.2,38.1l20,28.1 c-5.5,10.5-9.9,21.4-13.3,32.7l-33.2,5.6c-14.3,2.4-24.7,14.7-24.7,29.2v42.1c0,14.5,10.4,26.8,24.7,29.2l34,5.8 c3.5,11.2,8.1,22.1,13.7,32.5l-19.7,27.4c-8.4,11.8-7.1,27.9,3.2,38.1l29.8,29.8c5.6,5.6,13,8.7,20.9,8.7c6.2,0,12.1-1.9,17.1-5.5 l28.1-20c10.1,5.3,20.7,9.6,31.6,13l5.6,33.6c2.4,14.3,14.7,24.7,29.2,24.7h42.2c14.5,0,26.8-10.4,29.2-24.7l5.7-33.6 c11.3-3.5,22.2-8,32.6-13.5l27.7,19.8c5,3.6,11,5.5,17.2,5.5l0,0c7.9,0,15.3-3.1,20.9-8.7l29.8-29.8c10.2-10.2,11.6-26.3,3.2-38.1 l-19.8-27.8c5.5-10.5,10.1-21.4,13.5-32.6l33.6-5.6c14.3-2.4,24.7-14.7,24.7-29.2v-42.1 C478.9,203.801,468.5,191.501,454.2,189.101z M451.9,260.401c0,1.3-0.9,2.4-2.2,2.6l-42,7c-5.3,0.9-9.5,4.8-10.8,9.9 c-3.8,14.7-9.6,28.8-17.4,41.9c-2.7,4.6-2.5,10.3,0.6,14.7l24.7,34.8c0.7,1,0.6,2.5-0.3,3.4l-29.8,29.8c-0.7,0.7-1.4,0.8-1.9,0.8 c-0.6,0-1.1-0.2-1.5-0.5l-34.7-24.7c-4.3-3.1-10.1-3.3-14.7-0.6c-13.1,7.8-27.2,13.6-41.9,17.4c-5.2,1.3-9.1,5.6-9.9,10.8l-7.1,42 c-0.2,1.3-1.3,2.2-2.6,2.2h-42.1c-1.3,0-2.4-0.9-2.6-2.2l-7-42c-0.9-5.3-4.8-9.5-9.9-10.8c-14.3-3.7-28.1-9.4-41-16.8 c-2.1-1.2-4.5-1.8-6.8-1.8c-2.7,0-5.5,0.8-7.8,2.5l-35,24.9c-0.5,0.3-1,0.5-1.5,0.5c-0.4,0-1.2-0.1-1.9-0.8l-29.8-29.8 c-0.9-0.9-1-2.3-0.3-3.4l24.6-34.5c3.1-4.4,3.3-10.2,0.6-14.8c-7.8-13-13.8-27.1-17.6-41.8c-1.4-5.1-5.6-9-10.8-9.9l-42.3-7.2 c-1.3-0.2-2.2-1.3-2.2-2.6v-42.1c0-1.3,0.9-2.4,2.2-2.6l41.7-7c5.3-0.9,9.6-4.8,10.9-10c3.7-14.7,9.4-28.9,17.1-42 c2.7-4.6,2.4-10.3-0.7-14.6l-24.9-35c-0.7-1-0.6-2.5,0.3-3.4l29.8-29.8c0.7-0.7,1.4-0.8,1.9-0.8c0.6,0,1.1,0.2,1.5,0.5l34.5,24.6 c4.4,3.1,10.2,3.3,14.8,0.6c13-7.8,27.1-13.8,41.8-17.6c5.1-1.4,9-5.6,9.9-10.8l7.2-42.3c0.2-1.3,1.3-2.2,2.6-2.2h42.1 c1.3,0,2.4,0.9,2.6,2.2l7,41.7c0.9,5.3,4.8,9.6,10,10.9c15.1,3.8,29.5,9.7,42.9,17.6c4.6,2.7,10.3,2.5,14.7-0.6l34.5-24.8 c0.5-0.3,1-0.5,1.5-0.5c0.4,0,1.2,0.1,1.9,0.8l29.8,29.8c0.9,0.9,1,2.3,0.3,3.4l-24.7,34.7c-3.1,4.3-3.3,10.1-0.6,14.7 c7.8,13.1,13.6,27.2,17.4,41.9c1.3,5.2,5.6,9.1,10.8,9.9l42,7.1c1.3,0.2,2.2,1.3,2.2,2.6v42.1H451.9z"/> <path d="M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001 z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z"/> </g></svg>
          </foreignObject>
          {listRect}
        </g>
      )
    })
    return polygons
  }

  showElements(e, index){
    let a = this.state.highlighted.slice(); //creates the clone of the state
    a[index] = true;
    this.setState({highlighted: a});
    this.setState({hoverOn: true});
  }

  hideElements(e, index){
    let a = this.state.highlighted.slice(); //creates the clone of the state
    a[index] = false;
    this.setState({highlighted: a});
    this.setState({hoverOn: false});
  }

  openDetailsPopup(index){
    this.setState({showDetailsPopup: true});
  }

  closeDetailsPopup(){
    this.setState({showDetailsPopup: false});
  }

  getDetailsPopup() {
    var currentPolygon = this.state.listPolygon.filter((objPolygon, index) => index)
    let output = null
    if(this.state.showDetailsPopup){
      output = (
        <Modal open={true} onClose={() => this.closeDetailsPopup()}>
          
        </Modal>
      )
    }
    return output
  }
  
  addRectOnImage(e){
    if(this.state.isDrawing){
      const tempListPolygon = this.state.listPolygon
      let lastPolygon = tempListPolygon[tempListPolygon.length - 1]
      lastPolygon.coordinates.push({x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY})
      tempListPolygon[tempListPolygon.length - 1] = lastPolygon
      this.setState({
        listPolygon: tempListPolygon,
      })
    }
    else if(!this.state.hoverOn) {
      const tempListPolygon = this.state.listPolygon
      tempListPolygon.push({
        coordinates: [{x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY}]
      })
      this.setState({
        isDrawing: true,
        listPolygon: tempListPolygon
      })
    }
  }

  handleMouseMove(e){
    if(this.state.isDrawing){
      this.setState({
        draggingPosition: `${e.nativeEvent.offsetX},${e.nativeEvent.offsetY}`
      })
    }
  }

  handleRemoveListImageMap(removeIndex){
    const tempListPolygon = this.state.listPolygon.filter((objPolygon, index) => removeIndex !== index)
    this.setState({
      listPolygon: tempListPolygon
    })
    this.setState({hoverOn: false});
  }

  getListImageMap(){
    let listMap = null
    if(this.state.listPolygon.length > 0){
      listMap = this.state.listPolygon.map((objPolygon, index) => {
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
          <RaisedButton label="Get Coordinate" primary={true} onClick={() => this.showResult()}/>
        </ToolbarGroup>
      </Toolbar>
    )
  }

  showResult(){
    this.setState({
      showResult: true
    })
  }

  closeResult(){
    this.setState({
      showResult: false
    })
  }

  getResultModal(){
    let output = null
    if(this.state.showResult){
      let arrayPoint = this.state.listPolygon.map((obj, index) => {
        let points = obj.coordinates.map((objCoor) => {
          return `${objCoor.x},${objCoor.y}`
        })
        points = points.join(' ')
        return `<polygon points="${points}" />`
      })
      arrayPoint = arrayPoint.join('\n')
      const code = `
<svg width="0" height="0">
<clipPath id="clipPath">
  ${arrayPoint}
</clipPath>
</svg>
      `
      output = (
        <Modal open={true} onClose={() => this.closeResult()}>
          <CodeMirror
            value={code}
            width="100%"
            height="100%"
            options={{
              mode: 'htmlmixed',
              readOnly: true
            }}
          />
        </Modal>
      )
    }
    return output
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
        {this.getResultModal()}
        {this.getDetailsPopup()}
      </div>
    )
  }
}
