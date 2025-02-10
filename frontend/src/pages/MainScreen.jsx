import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCw, Save, Upload, RotateCw, Lightbulb } from 'lucide-react';
import '../styles/MainScreen.css';

// Comprehensive list of CO2 control suggestions
const CO2_CONTROL_SUGGESTIONS = [
    {
        id: 1,
        category: 'Transportation',
        suggestion: 'Implement city-wide electric vehicle charging infrastructure',
        impact: 'Potential CO2 Reduction: 15-20%',
        difficulty: 'High',
        estimatedCost: 'High'
    },
    {
        id: 2,
        category: 'Energy',
        suggestion: 'Transition to 50% renewable energy sources',
        impact: 'Potential CO2 Reduction: 25-30%',
        difficulty: 'Medium',
        estimatedCost: 'High'
    },
    {
        id: 3,
        category: 'Forestry',
        suggestion: 'Large-scale reforestation program',
        impact: 'Potential CO2 Reduction: 10-15%',
        difficulty: 'Low',
        estimatedCost: 'Medium'
    },
    {
        id: 4,
        category: 'Industrial',
        suggestion: 'Implement carbon capture technologies in major industries',
        impact: 'Potential CO2 Reduction: 20-25%',
        difficulty: 'High',
        estimatedCost: 'Very High'
    },
    {
        id: 5,
        category: 'Agriculture',
        suggestion: 'Promote regenerative farming practices',
        impact: 'Potential CO2 Reduction: 8-12%',
        difficulty: 'Medium',
        estimatedCost: 'Low'
    },
    {
        id: 6,
        category: 'Urban Planning',
        suggestion: 'Develop green urban spaces and vertical gardens',
        impact: 'Potential CO2 Reduction: 5-10%',
        difficulty: 'Low',
        estimatedCost: 'Medium'
    },
    {
        id: 7,
        category: 'Energy Efficiency',
        suggestion: 'Mandatory energy efficiency standards for buildings',
        impact: 'Potential CO2 Reduction: 12-18%',
        difficulty: 'Medium',
        estimatedCost: 'Medium'
    }
];

const MainScreen = () => {
    const [sliders, setSliders] = useState({
        "Air Pollutants (PPM)": 70.0,
        "Vehicles (Count)": 15000.0,
        "Factories (Count)": 800.0,
        "Land Use & Biomass (Hectares)": 400.0,
        "Combustion (PPM)": 200.0,
        "Trees (Count)": 10000.0
    });

    const [co2Level, setCo2Level] = useState(8100.0);
    const [graphData, setGraphData] = useState([]);
    const [simulationYear, setSimulationYear] = useState(2050);
    const [showAlert, setShowAlert] = useState(false);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        initializeGraphData();
    }, []);

    useEffect(() => {
        generateSuggestions();
    }, [co2Level]);

    const generateSuggestions = useCallback(() => {
        const currentTimestamp = new Date().toLocaleString();
        
        let filteredSuggestions = [];
        if (co2Level > 450) {
            filteredSuggestions = CO2_CONTROL_SUGGESTIONS;
        } else if (co2Level > 350) {
            filteredSuggestions = CO2_CONTROL_SUGGESTIONS.filter(
                suggestion => suggestion.difficulty !== 'High'
            );
        } else {
            filteredSuggestions = CO2_CONTROL_SUGGESTIONS.filter(
                suggestion => suggestion.difficulty === 'Low'
            );
        }

        const randomSuggestions = filteredSuggestions
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(suggestion => ({
                ...suggestion,
                timestamp: currentTimestamp
            }));

        setSuggestions(randomSuggestions);
    }, [co2Level]);

    const initializeGraphData = () => {
        const initialData = Array.from({ length: 2}, (_, i) => ({
            year: 2024 + i*26,
            co2Level: co2Level,        
        }));
        setGraphData(initialData);
    };

    const handleSliderChange = async (key, value) => {
        setSliders(prev => ({ ...prev, [key]: value }));
        await updateCO2Level();
    };

    const updateCO2Level = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(sliders),
            });

            const data = await response.json();

            if (data.status === 'success') {
                const predictedCO2 = parseFloat(data["Predicted CO2 Levels (PPM)"]);

                setCo2Level(predictedCO2);
                setGraphData(prevData => {
                    const newData = [...prevData];
                    newData[newData.length - 1].co2Level = predictedCO2;
                    return newData;
                });

                if (predictedCO2 < 350 && !showAlert) {
                    setShowAlert(true);
                } else if (predictedCO2 >= 350 && showAlert) {
                    setShowAlert(false);
                }
            } else {
                setErrorMessage(data.error || 'Unexpected error occurred');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetSliders = () => {
        const defaultSliders = {
            "Air Pollutants (PPM)": 70.0,
            "Vehicles (Count)": 15000.0,
            "Factories (Count)": 800.0,
            "Land Use & Biomass (Hectares)": 400.0,
            "Combustion (PPM)": 200.0,
            "Trees (Count)": 10000.0
        };
        
        setSliders(defaultSliders);
        setCo2Level(8100);
        initializeGraphData();
        setShowAlert(false);
        setSimulationYear(2050);
        setIsSimulationRunning(false);
        setErrorMessage(null);
    };

    const saveConfiguration = () => {
        try {
            localStorage.setItem('sliderConfig', JSON.stringify(sliders));
            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration.');
        }
    };

    const loadConfiguration = () => {
        try {
            const savedConfig = JSON.parse(localStorage.getItem('sliderConfig'));
            if (savedConfig) {
                setSliders(savedConfig);
                updateCO2Level();
                alert('Configuration loaded successfully!');
            } else {
                alert('No saved configuration found.');
            }
        } catch (error) {
            alert('Failed to load configuration.');
        }
    };

    const runSimulation = () => {
        setIsSimulationRunning(true);
        const interval = setInterval(() => {
            setSimulationYear(prevYear => {
                if (prevYear >= 2050) {
                    clearInterval(interval);
                    setIsSimulationRunning(false);
                    return 2050;
                }
                return prevYear + 1;
            });
            updateCO2Level();
        }, 500);
    };

    const generateReport = () => {
        const report = `
CO2 Level Report - ${new Date().toLocaleString()}

Current CO2 Level: ${co2Level} ppm
Simulation Year: ${simulationYear}

Slider Settings:
${Object.entries(sliders).map(([key, value]) => `${key}: ${value}%`).join('\n')}
        `;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'co2_level_report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div>
            <div className="simulator-container p-4 bg-gray-100 min-h-screen">
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">CO₂ Prediction Model</h1>
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <AlertCircle className="inline-block mr-2" />
                        {errorMessage}
                    </div>
                )}

                <div className="main-content flex flex-col lg:flex-row gap-8">
                    <div className="visualization lg:flex-1 bg-white p-6 rounded-lg shadow-lg">
                        <div className="graph-container bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis domain={[8100, 8200]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="co2Level" 
                                        stroke="#8884d8" 
                                        strokeWidth={2} 
                                        dot={{ r: 4 }} 
                                        activeDot={{ r: 8 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center items-center mt-4">
                                <RefreshCw className="animate-spin text-blue-500" size={24} />
                                <span className="ml-2">Calculating...</span>
                            </div>
                        )}

                        {showAlert && (
                            <div className="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-700" role="alert">
                                <h3 className="font-medium mb-1 flex items-center">
                                    <AlertCircle className="mr-2" /> Warning
                                </h3>
                                <div>CO₂ levels have dropped below 350 ppm. This may have unintended consequences on the ecosystem.</div>
                            </div>
                        )}

                        <div className="simulation-controls mt-4 flex justify-between items-center">
                            <div className="simulation-year text-lg font-semibold">Year: {simulationYear}</div>
                            <div className="predicted-co2 text-lg font-semibold">Predicted CO₂ Level: {co2Level} ppm</div>
                            <button
                                className={`flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors ${isSimulationRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={runSimulation}
                                disabled={isSimulationRunning}
                            >
                                {isSimulationRunning ? <RotateCw className="mr-2 animate-spin" /> : null}
                                {isSimulationRunning ? 'Simulating...' : 'Run Simulation'}
                            </button>
                        </div>
                    </div>

                    <div className="control-panel lg:flex-1 bg-white p-6 rounded-lg shadow-lg overflow-y-auto" style={{ maxHeight: "calc(100vh - 2rem)" }}>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Control Panel</h2>
                        
                        <div className="slider-group">
                            {Object.entries(sliders).map(([key, value]) => (
                                <div key={key} className="slider-control mb-4">
                                    <label className="block text-gray-700 font-medium mb-2">{key}</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 text-sm w-12">{value.toFixed(1)}</span>
                                        <input
                                            type="range"
                                            min={key.includes("Count") ? "0" : "0.0"}
                                            max={key.includes("Count") ? "30000" : "500.0"}
                                            step="0.1"
                                            value={value}
                                            onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                                            className="slider flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            aria-label={`Slider for ${key}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="button-group grid grid-cols-2 gap-4 mt-8">
                            <button 
                                className="flex items-center justify-center bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors" 
                                onClick={generateReport}
                            >
                                <Save className="mr-2" /> Generate Report
                            </button>
                            
                            <button 
                                className="flex items-center justify-center bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors" 
                                onClick={resetSliders}
                            >
                                <RotateCw className="mr-2" /> Reset
                            </button>
                            
                            <button 
                                className="flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors" 
                                onClick={saveConfiguration}
                                >
                                <Save className="mr-2" /> Save Config
                            </button>
                            
                            <button 
                                className="flex items-center justify-center bg-yellow-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors" 
                                onClick={loadConfiguration}
                            >
                                <Upload className="mr-2" /> Load Config
                            </button>
                        </div>
                    </div>
                </div>

                {/* Suggestions Section */}
                <div className="suggestions-container mt-8 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Lightbulb className="mr-2 text-yellow-500" /> CO₂ Control Suggestions
                    </h2>
                    
                    {suggestions.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-4">
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={suggestion.id} 
                                    className="suggestion-card border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="font-bold text-lg mb-2">
                                        {suggestion.category}
                                    </div>
                                    <p className="text-gray-700 mb-2">
                                        {suggestion.suggestion}
                                    </p>
                                    <div className="text-sm">
                                        <div className="text-green-600">
                                            Impact: {suggestion.impact}
                                        </div>
                                        <div className="text-blue-600">
                                            Difficulty: {suggestion.difficulty}
                                        </div>
                                        <div className="text-gray-500 mt-2">
                                            Timestamp: {suggestion.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">
                            No suggestions available at the moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainScreen;