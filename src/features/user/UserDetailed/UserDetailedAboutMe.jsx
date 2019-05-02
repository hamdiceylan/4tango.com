import React from 'react'
import { Segment, Grid, Header, List, Item, Icon} from 'semantic-ui-react'
import format from 'date-fns/format'

const UserDetailedAboutMe = ({user}) => {
    let createdAt;
    if(user.createdAt) {
        createdAt = format(user.createdAt.toDate(), 'D MMM YYYY')
    } 
  return (
    <Grid.Column width={12}>
        <Segment>
            <Grid columns={2}>
                <Grid.Column width={10}>
                    <Header icon='smile' content='About Display Name'/>
                    <p>I am a: <strong>{user.occupation || 'tbn'}</strong></p>
                    <p>Originally from <strong>{user.origin || 'tbn'}</strong></p>
                    <p>Member Since: <strong>{createdAt}</strong></p>
                    <p>Description of user</p> <strong>{user.about}</strong>

                </Grid.Column>
                <Grid.Column width={6}>

                    <Header icon='heart outline' content='Interests'/>
                    {user.interests && user.interests.length > 0 ?
                        <List>
                            {user.interests &&
                                user.interests.map((interest, index) => (
                                    <Item key={index}>
                                        <Icon name='heart'/>
                                        <Item.Content>{interest}</Item.Content>
                                    </Item>
                                ))}
                        </List>  : <div>No interest</div>}
                </Grid.Column>
            </Grid>
        </Segment>
    </Grid.Column>

  )
}

export default UserDetailedAboutMe
