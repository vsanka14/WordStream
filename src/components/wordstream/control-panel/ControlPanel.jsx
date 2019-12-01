import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import youtubeData from '../data/main/youtube_py.json';
import olympicData from '../data/main/data_by_NOC.json';
import olympicSportData from '../data/main/data_by_Sport.json';
import calcLayers from './calcLayers';
import calcWords from './calcWords';
import * as $ from 'jquery';
import './ControlPanel.css';

export default class ControlPanel extends React.Component {
    constructor(props) {
        super(props);
        this.animatedComponents = makeAnimated();
        this.fileList = [
            {value: "youtube", label: "YouTube Trending"},
            {value: "olympic", label: "Olympics by Countries"},
            {value: "olympic_sport", label: "Olympics by Sports"}
        ]
        this.olympicCountryOptions = [
            {value: "Italy", label: "Italy"},
            {value: "United States", label: "United States"},
            {value: "Denmark", label: "Denmark"},
            {value: "France", label: "France"},
            {value: "Great Britain", label: "Great Britain"},
            {value: "Hungary", label: "Hungary"},
            {value: "Netherlands", label: "Netherlands"},
            {value: "Switzerland", label: "Switzerland"},
            {value: "Argentina", label: "Argentina"},
            {value: "Austria", label: "Austria"}
        ]
        this.youtubeOptions = [
            {value: "Gaming", label: "Gaming"},
            {value: "Howto & Style", label: "Howto & Style"},
            {value: "News & Politics", label: "News & Politics"},
            {value: "Pets & Animals", label: "Pets & Animals"},
            {value: "Music", label: "Music"},
            {value: "People & Blogs", label: "People & Blogs"},
            {value: "Science & Technology", label: "Science & Technology"},
            {value: "Sports", label: "Sports"}
        ]
        this.olympicSportOptions = [
            {value: "Equestrianism", label: "Equestrianism"},
            {value: "Diving", label: "Diving"},
            {value: "Boxing", label: "Boxing"},
            {value: "Football", label: "Football"},
            {value: "Water Polo", label: "Water Polo"},
            {value: "Athletics", label: "Athletics"},
            {value: "Sailing", label: "Sailing"},
            {value: "Wrestling", label: "Wrestling"},
            {value: "Rowing", label: "Rowing"},
            {value: "Swimming", label: "Swimming"},
            {value: "Cycling", label: "Cycling"},
            {value: "Shooting", label: "Shooting"},
            {value: "Weightlifting", label: "Weightlifting"}
        ]
        this.state = {
            selectedOption: null,
            currentData: null,
            noOfTopTerms: 40,
            minFontSize: 10,
            maxFontSize: 24,
            topicOptions: null,
            selectedTopicOptions: null,
            selectedTopics: null
        }
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleControlPanelSubmit = this.handleControlPanelSubmit.bind(this);
        this.trimTerms = this.trimTerms.bind(this);
    }

    handleFormChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSelectChange(selectedOption) {
        this.setState({
            selectedOption: selectedOption
        });
        let selectedTopicOptions;
        let topicOptions;
        switch(selectedOption.value) {
            case 'youtube':
                topicOptions = this.youtubeOptions;
                selectedTopicOptions = [
                    {value: "Gaming", label: "Gaming"},
                    {value: "News & Politics", label: "News & Politics"},
                    {value: "Music", label: "Music"},
                    {value: "Science & Technology", label: "Science & Technology"}
                ];
                break;
            case 'olympic':
                topicOptions = this.olympicCountryOptions;
                selectedTopicOptions = [
                    {value: "United States", label: "United States"},
                    {value: "Great Britain", label: "Great Britain"},
                    {value: "France", label: "France"},
                    {value: "Netherlands", label: "Netherlands"}
                ];
                break;
            case 'olympic_sport':
                topicOptions = this.olympicSportOptions;
                selectedTopicOptions = [
                    {value: "Swimming", label: "Swimming"},
                    {value: "Diving", label: "Diving"},
                    {value: "Boxing", label: "Boxing"},
                    {value: "Football", label: "Football"},
                ]
        }
        this.setState({
            topicOptions: topicOptions,
            selectedTopicOptions: selectedTopicOptions,
            selectedTopics : selectedTopicOptions.map(item=>item.value)
        });
    }

    trimTerms(currentData) {
        currentData.forEach(item=>{
            Object.keys(item.words).forEach(topic=>{
                item.words[topic].splice(this.state.noOfTopTerms);
            });
        });
    }

    keepSelectedTopics(currentData) {
        currentData.forEach(item=>{
            Object.keys(item.words).forEach(topic=>{
                if(!this.state.selectedTopics.includes(topic)) {
                    delete item.words[topic];
                }
            });
        });
    }

    handleControlPanelSubmit(e) {
        e.preventDefault();
        let currentData = null;
        let activeGraph = null;
        switch(this.state.selectedOption.value) {
            case 'youtube':
                currentData = $.extend(true, [], youtubeData);
                activeGraph = 'youtube';
                break;
            case 'olympic':
                currentData = $.extend(true, [], olympicData);
                activeGraph = 'olympic';
                break;
            case 'olympic_sport':
                currentData = $.extend(true, [], olympicSportData);
                activeGraph = 'olympic_sport';
                break;
        }
        this.keepSelectedTopics(currentData);
        this.trimTerms(currentData);
        let layersData = calcLayers({
            data: currentData,
            screenDimensions: this.props.screenDimensions
        });
        let wordsData = calcWords({
            data: currentData,
            screenDimensions: this.props.screenDimensions,
            minFontSize: parseInt(this.state.minFontSize),
            maxFontSize: parseInt(this.state.maxFontSize),
            ...layersData
        });
        let allWords = [];
        wordsData.map((row)=>{
            layersData.fields.forEach(topic => {
                allWords = allWords.concat(row.words[topic]);
            });
        });
        this.props.setActiveGraph(activeGraph);
        this.props.setLayersData(layersData);
        this.props.setWordsData(allWords);
        console.log('currentData: ', currentData);
    }

    render() {
        const { selectedOption, minFontSize, maxFontSize, noOfTopTerms } = this.state;
        return (
            <div className="col-12">
                <form>
                    <div className="form-group row">
                        <label className="control-label"> Choose dataset </label>
                        <Select
                            theme={theme => ({
                                ...theme,
                                borderRadius: 0,
                                colors: {
                                    ...theme.colors,
                                    primary25: 'hotpink',
                                    primary: 'black',
                                },
                            })}
                            className="col-12"
                            value={selectedOption}
                            onChange={this.handleSelectChange}
                            options={this.fileList}
                        />
                    </div> 
                    <div className="form-group row">
                        <label className="control-label" htmlFor="topTerms"> Top terms: <span className="range-slider__value">{noOfTopTerms}</span></label> 
                        <div className="col-12 ml-2"> 
                            <input 
                                type="range" 
                                id="topTerms" 
                                className="form-control range-slider__range" 
                                value={noOfTopTerms}
                                name="noOfTopTerms"
                                onChange={this.handleFormChange}/>
                        </div>
                    </div> 
                    <div className="form-group row">
                        <label className="control-label" htmlFor="minFont"> Minimum Font Size: <span className="range-slider__value">{minFontSize}</span></label> 
                        <div className="col-12 ml-2"> 
                            <input 
                                type="range" 
                                id="minFont" 
                                className="form-control range-slider__range"
                                value={minFontSize}
                                name="minFontSize"
                                onChange={this.handleFormChange}
                                />
                        </div>
                    </div> 
                    <div className="form-group row">
                        <label className="control-label" htmlFor="topTerms"> Maximum Font Size:  <span className="range-slider__value">{maxFontSize}</span> </label> 
                        <div className="col-12 ml-2 range-slider"> 
                            <input 
                                type="range" 
                                id="maxFont" 
                                className="form-control range-slider__range"
                                value={maxFontSize}
                                name="maxFontSize"
                                onChange={this.handleFormChange}/>
                        </div>
                    </div> 
                    <div className="form-group row">
                        <label className="control-label"> Add more topics. </label>
                        <Select
                            theme={theme => ({
                                ...theme,
                                borderRadius: 0,
                                colors: {
                                    ...theme.colors,
                                    primary25: 'hotpink',
                                    primary: 'black',
                                },
                            })}
                            components={this.animatedComponents}
                            isMulti
                            className="col-12"
                            options={this.state.topicOptions}
                            value={this.state.selectedTopicOptions}
                            onChange={(options)=>{
                                let selectedTopics = options ? options.map(item=>item.value) : null
                                this.setState(
                                    {
                                        selectedTopics: selectedTopics,
                                        selectedTopicOptions: options
                                    
                                    })
                            }}
                        />
                    </div> 
                    {/* <CustomizedRange/> */}
                    <br/>
                    <button className="btn btn-lg d-flex submitBtn" onClick={this.handleControlPanelSubmit} disabled={!this.state.selectedTopics}> Submit </button>
                </form>
           </div>
        )
    }
}