'use strict';
(()=>{
 const form=document.querySelector('#tracking-form');if(!form)return;
 const result=document.querySelector('#tracking-result'),feedback=document.querySelector('#tracking-feedback');
 function lookup(id){feedback.textContent='';const normalized=id.trim().toUpperCase();form.elements.tracking.value=normalized;result.innerHTML='';if(!normalized){feedback.textContent='Enter a tracking number to find a shipment.';return;}if(!/^(AW-\d{6}|AWL-[A-F0-9]{12})$/.test(normalized)){feedback.textContent='Use an ARCWAY sample ID (AW-100241) or the full AWL reference from a locally saved pickup.';return;}const s=Arcway.findShipment(normalized);history.replaceState(null,'','?id='+encodeURIComponent(normalized));if(!s){result.innerHTML='<div class="empty-state"><h3>No matching local record</h3><p>Check the full reference or try a sample ID. This demonstration cannot query real carrier shipments.</p></div>';return;}result.innerHTML='<div class="panel">'+Arcway.shipmentHTML(s)+'</div>';result.setAttribute('tabindex','-1');result.focus({preventScroll:true});}
 form.addEventListener('submit',e=>{e.preventDefault();lookup(form.elements.tracking.value);});
 document.querySelectorAll('[data-sample-id]').forEach(b=>b.addEventListener('click',()=>lookup(b.dataset.sampleId)));
 const id=new URLSearchParams(location.search).get('id');if(id)lookup(id);
 window.addEventListener('arcway:shipments',()=>{if(form.elements.tracking.value)lookup(form.elements.tracking.value);});
})();
