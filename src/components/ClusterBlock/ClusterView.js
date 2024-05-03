import React, { useState, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as PubSub from 'pubsub-js';

const ClusterView = ({ cluster: initialCluster }) => {
	const [cluster, setCluster] = useState(initialCluster);
	const [selected, setSelected] = useState(null);

	useEffect(() => {
		if (selected) {
			PubSub.publish("CLUSTER", cluster[selected]);
			PubSub.publish("DescriptorView.show", {
				id: 'cluster',
				name: 'Cluster',
				data: {
					'medoid': selected,
					'entries': cluster[selected].items
				}
			});
			PubSub.publish("TargetView.show", {
				name: "Cluster",
				data: cluster[selected].items
			});
		} else {
			PubSub.publish("CLUSTER", null);
			PubSub.publish("DescriptorView.hide", 'cluster');
			PubSub.publish("TargetView.hide", "Cluster");
		}
	}, [selected, cluster]);

	useEffect(() => {
		if (initialCluster !== cluster) {
			setCluster(initialCluster);
			setSelected(null);
		}
	}, [initialCluster, cluster]);

	const getOptions = () => {
		return {
			xAxis: {
				show: true,
				scale: true
			},
			yAxis: {
				show: true,
				scale: true
			},
			animation: false,
			series: [{
				type: 'scatter',
				data: Object.values(cluster).map((c) => {
					let colorValue = Math.min(16 * Math.log(c.radius), 127);
					return {
						name: c.id,
						value: c.pos,
						symbol: 'circle',
						symbolSize: 5 * Math.max(Math.log(c.items.length), 1),
						itemStyle: {
							color: 'rgb(' + colorValue + ',' + colorValue + ',' + colorValue + ')',
							borderColor: 'black',
							borderWidth: c.id === selected ? 5 : 0,
						}
					};
				})
			}]
		};
	};

	const handleClick = (event) => {
		setSelected((prevSelected) => (prevSelected !== event.name ? event.name : null));
	};

	const events = {
		'click': (e) => handleClick(e),
	};

	if (cluster === null)
		return <div className="ClusterView">Please choose cluster...</div>;
	return <ReactEcharts className="ClusterView" style={{ width: '100%', height: '100%' }} option={getOptions()} onEvents={events} />;
};

export default ClusterView;