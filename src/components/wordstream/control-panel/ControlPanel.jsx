import React from 'react';
import Select from 'react-select';
import {loadBlogPostData, loadAuthorData} from './loaddata';

export default class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.fileList = [
      {value: "WikiNews", label: "WikiNews"},
      {value: "Huffington", label: "Huffington"},
      {value: "CrooksAndLiars", label: "CrooksAndLiars"},
      {value: "EmptyWheel", label: "Esquire"},
      {value: "FactCheck", label: "FactCheck"},
      {value: "VIS_papers", label: "VIS_papers"},
      {value: "IMDB", label: "IMDB"},
      {value: "PopCha", label: "PopCha"},
      {value: "Cards_PC", label: "Cards_PC"},
      {value: "Cards_Fries", label: "Cards_Fries"},
    ];
    this.state = {
      selectedOption: null
    }
    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(selectedOption){
    let fileName = `${process.env.PUBLIC_URL}/data/${selectedOption.value}.tsv`;
    let categories;
    let authorData = true;
    let resultData = null;
      switch(selectedOption.value) {
        case 'Cards_Fries':
          categories = ["increases_activity", "decreases_activity"];
          break;
        case 'Cards_PC':
          categories = ["adds_modification", "removes_modification", "increases", "decreases", "binds", "translocation"];
          break;
        case 'PopCha':
          categories = ["Comedy", "Drama", "Action", "Fantasy", "Horror"];
          break;
        case 'IMDB':
          categories = ["Comedy", "Drama", "Action", "Family"];
          break;
        case 'VIS':
          categories = ["Vis", "VAST", "InfoVis", "SciVis"];
          break;
        case 'Huffington':
          categories = ["person", "location", "organization", "miscellaneous"];
          authorData = false;
          break;
        default:
          categories = ["person", "location", "organization", "miscellaneous"];
          authorData = false;
    };
    
    if(authorData) {
      resultData = await loadAuthorData(fileName, categories, 15);
    } else {
      resultData = await loadBlogPostData(fileName, categories, 15);
    }
    this.setState({
      selectedOption: selectedOption
    });
    this.props.setGraphData(resultData);
  }

  render() {
      const { selectedOption } = this.state;
  
      return (
        <div className="col-12">
          <Select
            value={selectedOption}
            onChange={this.handleChange}
            options={this.fileList}
          />
        </div>
      );
  }
}