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
      listPolygon: []
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
            <img src={this.state.imagePreviewUrl} width={this.state.imageWidth} height={this.state.imageHeigth}/>
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
      let coordinates = `${points}`
      if(this.state.draggingPosition !== undefined && index === this.state.listPolygon.length - 1){
        coordinates += ` ${this.state.draggingPosition}`
      }
      return (
        <g key={index}>
          <polygon className={polygonClassName} points={coordinates} />
          {listRect}
        </g>
      )
    })
    return polygons
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
    else{
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
          { this.getListImageMap() }
        </div>
        {this.getResultModal()}
      </div>
    )
  }
}
