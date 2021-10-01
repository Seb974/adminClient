import React, { useContext } from 'react'
import { CFooter } from '@coreui/react'
import PlatformContext from 'src/contexts/PlatformContext'
import { isDefined } from 'src/helpers/utils';

const TheFooter = () => {

  const { platform } = useContext(PlatformContext);

  return (
    <CFooter fixed={false}>
      <div>
        <span className="ml-1">&copy; { (new Date()).getFullYear() }{" "} <a href={ window.location.href.split('api.').join().split('/#/')[0] } target="_blank" rel="noopener noreferrer">{ isDefined(platform) ? platform.name : "" }</a></span>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">Powered with <i className="fa fa-heart text-danger"/> by <a href="#" target="_blank" rel="noopener noreferrer">Créazot</a></span>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
