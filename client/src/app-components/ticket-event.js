import React from 'react';
import classNames from 'classnames';

import i18n from 'lib-app/i18n';
import API from 'lib-app/api-call';

import DateTransformer from 'lib-core/date-transformer';
import Icon from 'core-components/icon';
import Tooltip from 'core-components/tooltip';
import Button from 'core-components/button';
import SubmitButton from 'core-components/submit-button';
import Form from 'core-components/form';
import FormField from 'core-components/form-field';

class TicketEvent extends React.Component {
    static propTypes = {
        type: React.PropTypes.oneOf([
            'COMMENT',
            'ASSIGN',
            'UN_ASSIGN',
            'CLOSE',
            'RE_OPEN',
            'DEPARTMENT_CHANGED',
        ]),
        author: React.PropTypes.object,
        content: React.PropTypes.string,
        ref_person: React.PropTypes.string,
        internal_phone: React.PropTypes.string,
        date: React.PropTypes.string,
        private: React.PropTypes.string,
        edited: React.PropTypes.bool,
        edit: React.PropTypes.bool,
        onToggleEdit: React.PropTypes.func
    };

    state = {
        content: this.props.content
    };

    render() {
        let iconNode = null;

        if (this.props.type === 'COMMENT' && this.props.author && this.props.author.staff) {
            iconNode = this.renderStaffPic();
        } else {
            iconNode = this.renderIcon();
        }

        return (
            <div className={this.getClass()}>
                <span className="ticket-event__connector" />
                <div className="col-md-1">
                    {iconNode}
                </div>
                <div className="col-md-11">
                    {this.renderEventDescription()}
                </div>
            </div>
        );
    }

    renderStaffPic() {
        let profilePicName = this.props.author.profilePic;

        return (
            <div className="ticket-event__staff-pic">
                <img src={(profilePicName) ? API.getFileLink(profilePicName) : (API.getURL() + '/images/profile.png')} className="ticket-event__staff-pic-img" />
            </div>
        );
    }

    renderIcon() {
        return (
            <div className="ticket-event__icon">
                <Icon {...this.getIconProps()}/>
            </div>
        );
    }

    renderEventDescription() {
        const renders = {
            'COMMENT': this.renderComment.bind(this),
            'ASSIGN': this.renderAssignment.bind(this),
            'UN_ASSIGN': this.renderUnAssignment.bind(this),
            'CLOSE': this.renderClosed.bind(this),
            'RE_OPEN': this.renderReOpened.bind(this),
            'DEPARTMENT_CHANGED': this.renderDepartmentChange.bind(this),
        };

        return renders[this.props.type]();
    }

    renderComment() {
        const author = this.props.author;
        const customFields = (author && author.customfields) || [];
        console.log("props: "); console.log(this.props);
        const ref_person = this.props.ref_person;
        const interno = this.props.internal_phone;
        console.log("interno: "); console.log(interno);
        console.log("ref_person:"); console.log(ref_person);

        if(this.props.author.staff){
            return (
                <div className="ticket-event__comment">
                    <span className="ticket-event__comment-pointer" />
                    <div className="ticket-event__comment-author">
                        <span className="ticket-event__comment-author-name">{this.props.author.name}</span>
                        <span className="ticket-event__comment-badge-container">
                            <span className="ticket-event__comment-badge">{i18n((this.props.author.staff) ? 'STAFF' : 'CUSTOMER')}</span>
                        </span>
                        {customFields.map(this.renderCustomFieldValue.bind(this))}
                        {(this.props.private*1) ? this.renderPrivateBadge() : null}
                    </div>
                    <div className="ticket-event__comment-date">{DateTransformer.transformToString(this.props.date)}</div>
                    {!this.props.edit ? this.renderContent() : this.renderEditField()}
                    {this.renderFooter(this.props.file)}
                </div>
            );
        }
        else{
            return (
                <div className="ticket-event__comment">
                    <span className="ticket-event__comment-pointer" />
                    <div className="ticket-event__comment-author">
                        <span className="ticket-event__comment-badge-container">
                            <span className="ticket-event__comment-badge">
                                {i18n('CUSTOMER')}: <span className="ticket-event__comment-badge-value">{this.props.author.name}</span>
                            </span>
                        </span>
                        <span className="ticket-event__comment-badge-container">
                            <span className="ticket-event__comment-badge">
                                {i18n('REF_PERSON')}: <span className="ticket-event__comment-badge-value">{this.props.ref_person}</span>
                            </span>
                        </span>
                        <span className="ticket-event__comment-badge-container">
                            <span className="ticket-event__comment-badge">
                                {i18n('INTERNAL_PHONE')}: <span className="ticket-event__comment-badge-value">{this.props.internal_phone}</span>
                            </span>
                        </span>
                        <span className="ticket-event__comment-badge-container">
                            <span className="ticket-event__comment-badge">
                                Email: <span className="ticket-event__comment-badge-value">{this.props.author.email}</span>
                            </span>
                        </span>
                        {customFields.map(this.renderCustomFieldValue.bind(this))}
                        {(this.props.private*1) ? this.renderPrivateBadge() : null}
                    </div>
                    <div className="ticket-event__comment-date">{DateTransformer.transformToString(this.props.date)}</div>
                    {!this.props.edit ? this.renderContent() : this.renderEditField()}
                    {this.renderFooter(this.props.file)}
                </div>
            );
        }
    }

    renderContent() {
        return (
            <div  className="ticket-event__comment-content ql-editor">
                <div dangerouslySetInnerHTML={{__html: this.props.content}}></div>
                {((this.props.author.id == this.props.userId && this.props.author.staff == this.props.userStaff) || this.props.userStaff) ? this.renderEditIcon() : null}
            </div>
        )
    }
    renderEditIcon() {
        return (
            <div className="ticket-event__comment-content__edit" >
                <Icon name="pencil" onClick={this.props.onToggleEdit} />
            </div>
        )
    }
    renderEditField() {
        return (
            <Form loading={this.props.loading} values={{content:this.state.content}} onChange={(form) => {this.setState({content:form.content})}} onSubmit={this.props.onEdit}>
                <FormField name="content" required field="textarea" validation="TEXT_AREA" fieldProps={{allowImages: this.props.allowAttachments}}/>
                <div className="ticket-event__submit-edited-comment" >
                    <SubmitButton  type="secondary" >{i18n('SUBMIT')}</SubmitButton>
                    <Button size="medium" onClick={this.props.onToggleEdit}>{i18n('CLOSE')}</Button>
                </div>
            </Form>
        );
    }
    renderAssignment() {
        let assignedTo = this.props.content;
        let authorName = this.props.author.name;

        if(!assignedTo || assignedTo == authorName) {
            assignedTo = i18n('HIMSELF');
        }

        return (
            <div className="ticket-event__circled">
                <span className="ticket-event__circled-author">{authorName}</span>
                <span className="ticket-event__circled-text"> {i18n('ACTIVITY_ASSIGN_THIS')}</span>
                <span className="ticket-event__circled-text"> {assignedTo}</span>
                <span className="ticket-event__circled-date"> {i18n('DATE_PREFIX')} {DateTransformer.transformToString(this.props.date)}</span>
            </div>
        )
    }

    renderUnAssignment() {
        let unAssignedTo = this.props.content;
        let authorName = this.props.author.name;

        if(!unAssignedTo || unAssignedTo == authorName) {
            unAssignedTo = i18n('HIMSELF');
        }

        return (
            <div className="ticket-event__circled">
                <span className="ticket-event__circled-author">{authorName}</span>
                <span className="ticket-event__circled-text"> {i18n('ACTIVITY_UN_ASSIGN_THIS')}</span>
                <span className="ticket-event__circled-text"> {unAssignedTo}</span>
                <span className="ticket-event__circled-date"> {i18n('DATE_PREFIX')} {DateTransformer.transformToString(this.props.date)}</span>
            </div>
        )
    }

    renderClosed() {
        return (
            <div className="ticket-event__circled">
                <span className="ticket-event__circled-author">{this.props.author.name}</span>
                <span className="ticket-event__circled-text"> {i18n('ACTIVITY_CLOSE_THIS')}</span>
                <span className="ticket-event__circled-date"> {i18n('DATE_PREFIX')} {DateTransformer.transformToString(this.props.date)}</span>
            </div>
        )
    }

    renderReOpened() {
        return (
            <div className="ticket-event__circled">
                <span className="ticket-event__circled-author">{this.props.author.name}</span>
                <span className="ticket-event__circled-text"> {i18n('ACTIVITY_RE_OPEN_THIS')}</span>
                <span className="ticket-event__circled-date"> {i18n('DATE_PREFIX')} {DateTransformer.transformToString(this.props.date)}</span>
            </div>
        );
    }

    renderDepartmentChange() {
        return (
            <div className="ticket-event__circled">
                <span className="ticket-event__circled-author">{this.props.author.name}</span>
                <span className="ticket-event__circled-text"> {i18n('ACTIVITY_DEPARTMENT_CHANGED_THIS')}</span>
                <span className="ticket-event__circled-indication"> {this.props.content}</span>
                <span className="ticket-event__circled-date"> {i18n('DATE_PREFIX')} {DateTransformer.transformToString(this.props.date)}</span>
            </div>
        );
    }

    renderPrivateBadge() {
        return (
            <span className="ticket-event__comment-badge-container">
                <Tooltip content={i18n('PRIVATE_RESPONSE_DESCRIPTION')} openOnHover>
                    <span className="ticket-event__comment-badge">{i18n('PRIVATE')}</span>
                </Tooltip>
            </span>
        );
    }

    renderFooter(file) {
        let node = null;
        let edited = null;

        if (file) {
            node = <span> {this.getFileLink(file)} <Icon name="paperclip" /> </span>;
        } else {
            node = i18n('NO_ATTACHMENT');
        }

        if (this.props.edited && this.props.type === 'COMMENT') {
            edited = i18n('COMMENT_EDITED');
        }

        return (
            <div className="ticket-event__items">
                <div className="ticket-event__edited">
                    {edited}
                </div>
                <div className="ticket-event__file">
                    {node}
                </div>
            </div>
        );
    }

    renderCustomFieldValue(customField) {
        return (
            <span className="ticket-event__comment-badge-container">
                <span className="ticket-event__comment-badge">
                    {customField.customfield}: <span className="ticket-event__comment-badge-value">{customField.value}</span>
                </span>
            </span>
        );
    }

    getClass() {
        const circledTypes = {
            'COMMENT': false,
            'ASSIGN': true,
            'UN_ASSIGN': true,
            'CLOSE': true,
            'RE_OPEN': true,
            'DEPARTMENT_CHANGED': true,
        };
        const classes = {
            'row': true,
            'ticket-event': true,
            'ticket-event_staff': this.props.author && this.props.author.staff,
            'ticket-event_circled': circledTypes[this.props.type],
            'ticket-event_unassignment': this.props.type === 'UN_ASSIGN',
            'ticket-event_close': this.props.type === 'CLOSE',
            'ticket-event_reopen': this.props.type === 'RE_OPEN',
            'ticket-event_department': this.props.type === 'DEPARTMENT_CHANGED',
            'ticket-event_private': this.props.private*1,
        };

        return classNames(classes);
    }

    getIconProps() {
        const iconName = {
            'COMMENT': 'comment-o',
            'ASSIGN': 'user',
            'UN_ASSIGN': 'user-times',
            'CLOSE': 'lock',
            'RE_OPEN': 'unlock-alt',
            'DEPARTMENT_CHANGED': 'exchange',
        };
        const iconSize = {
            'COMMENT': '2x',
            'ASSIGN': 'lg',
            'UN_ASSIGN': 'lg',
            'CLOSE': 'lg',
            'RE_OPEN': 'lg',
            'DEPARTMENT_CHANGED': 'lg',
        };

        return {
            name: iconName[this.props.type],
            size: iconSize[this.props.type]
        }
    }

    getFileLink(filePath = '') {
        const fileName = filePath.replace(/^.*[\\\/]/, '');

        return (
            <a href={API.getFileLink(filePath)}>{fileName}</a>
        )
    }
}

export default TicketEvent;
