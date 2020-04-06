import arrayMove from 'array-move';
import PropTypes from 'prop-types';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }) => value);

const SortableList = SortableContainer(({ questions }) => {
  return (
    <div>
      {questions.map((value, index) => (
        <SortableItem key={`item-${value.key}`} index={index} value={value}
                      disabled={questions.length === 1} />
      ))}
    </div>
  );
});

class SortContainer extends React.Component {
  onSortEnd({ oldIndex, newIndex }) {
    const newList = arrayMove(this.props.questions, oldIndex, newIndex);
    this.props.onResort(newList.map(q => q.key));
  };

  render() {
    return <div className="noselect">
      <SortableList questions={this.props.questions} onSortEnd={this.onSortEnd.bind(this)}
                    helperClass='sortableHelper' lockAxis="y" />
    </div>;
  }
}

SortContainer.propTypes = {
  questions: PropTypes.array.isRequired,
  onResort: PropTypes.func.isRequired,
};

export default SortContainer;
