import { connect } from 'react-redux';
import RepairRequestList from '../../components/repairRequests/RepairRequestList';

/**
 * @param {object} state
 * @returns {object}
 */
const mapStateToProps = (state) => ({
    ...state.repairRequest,
});

export default connect(mapStateToProps)(RepairRequestList);
