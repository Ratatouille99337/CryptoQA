import _ from '@lodash';

/**
 * The label model.
 */
function LabelModel(data) {
	data = data || {};
	return _.defaults(data, {
		id: _.uniqueId(),
		title: ''
	});
}

export default LabelModel;
