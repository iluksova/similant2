import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as PubSub from 'pubsub-js';
import SetTokens from './DescriptorViews/SetTokens';

const DescriptorView = ({ descriptor: initialDescriptor }) => {
	const [descriptor, setDescriptor] = useState(initialDescriptor);
	const [series, setSeries] = useState(new Map());

	useEffect(() => {
		const showSubscription = PubSub.subscribe("DescriptorView.show", (_, series) => {
			setSeries(prevSeries => new Map([...prevSeries, [series.id, series]]));
		});

		const hideSubscription = PubSub.subscribe("DescriptorView.hide", (_, seriesKey) => {
			const newSeries = new Map(series);
			newSeries.delete(seriesKey);
			setSeries(newSeries);
		});

		return () => {
			PubSub.unsubscribe(showSubscription);
			PubSub.unsubscribe(hideSubscription);
		};
	}, []);

	useEffect(() => {
		if (initialDescriptor !== descriptor) {
			setDescriptor(initialDescriptor);
			setSeries(new Map());
		}
	}, [initialDescriptor, descriptor]);

	const getOptions = () => {
		if (!descriptor) return {};

		switch (descriptor.type) {
			case 'time-series':
				return {
					legend: {
						data: Array.from(series.keys()),
						align: 'left'
					},
					xAxis: {
						data: descriptor.axis
					},
					yAxis: {},
					animation: false,
					series: Array.from(series.values()).map((seriesItem) => {
						return {
							name: seriesItem.name,
							type: 'bar',
							data: seriesItem.data.entries.map((key) => {
								return descriptor.data[key];
							}).reduce((accumulator, value) => {
								return accumulator.map((num, idx) => {
									return Number.parseFloat(num) + Number.parseFloat(value[idx]);
								});
							}).map((num) => {
								return num / seriesItem.data.entries.length;
							})
						};
					})
				};
			default:
				return {};
		}
	};

	if (!descriptor) {
		return <div className="DescriptorView">Please choose descriptor...</div>;
	}

	switch (descriptor.type) {
		case 'time-series':
			return <ReactEcharts className="DescriptorView" style={{ width: '100%', height: '100%' }} option={getOptions()} notMerge={true} lazyUpdate={false} />;
		case 'set-tokens':
			return <SetTokens descriptor={descriptor} datasets={Array.from(series.values())} />;
		default:
			return <div>Unknown descriptor: {descriptor.type}</div>;
	}
};

export default DescriptorView;