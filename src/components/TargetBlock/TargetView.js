import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as PubSub from 'pubsub-js';

const TargetView = ({ target: initialTarget }) => {
	const [target, setTarget] = useState(initialTarget);
	const [series, setSeries] = useState(new Map());

	useEffect(() => {
		const showSubscription = PubSub.subscribe("TargetView.show", (_, series) => {
			setSeries(prevSeries => new Map([...prevSeries, [series.name, series]]));
		});

		const hideSubscription = PubSub.subscribe("TargetView.hide", (_, seriesKey) => {
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
		if (initialTarget !== target) {
			setTarget(initialTarget);
		}
	}, [initialTarget, target]);

	const getOptions = () => {
		if (!target) return {};

		switch (target.type) {
			case 'ordinal':
				return {
					legend: {
						data: Array.from(series.keys()),
						align: 'left'
					},
					xAxis: {
						data: target.axis
					},
					yAxis: {},
					animation: false,
					series: Array.from(series.values()).map(seriesItem => {
						return {
							name: seriesItem.name,
							type: 'bar',
							data: target.axis.map(key => {
								const ret = seriesItem.data.filter(k => target.data[k] === key).length;
								return ret !== 0 ? Math.log(ret) : 0;
							})
						};
					})
				};

			case 'histogram':
				return {
					legend: {
						data: Array.from(series.keys()),
						align: 'left'
					},
					xAxis: {
						data: target.bins,
					},
					yAxis: {},
					animation: false,
					series: Array.from(series.values()).map(seriesItem => {
						let lastValue = 0;
						return {
							name: seriesItem.name,
							type: 'bar',
							data: target.bins.map(key => {
								let ret = seriesItem.data.filter(k => lastValue < target.data[k] && target.data[k] <= key).length;
								lastValue = key;
								return ret !== 0 ? Math.log(ret) : 0;
							})
						};
					})
				};

			default:
				return {};
		}
	};

	if (!target) {
		return <div className="TargetView">Please choose target...</div>;
	}

	return <ReactEcharts className="TargetView" option={getOptions()} notMerge={true} lazyUpdate={false} />;
};

export default TargetView;