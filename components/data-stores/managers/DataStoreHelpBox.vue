<script setup lang="ts">
import { HelpTextField } from "~/components/data-stores/managers/index";

const props = defineProps({
  helpField: String || null,
});

const emit = defineEmits(["closeHelp"]);

const closeHelp = () => {
  emit("closeHelp");
};
</script>

<template>
  <div class="data-store-help">
    <div
      class="methods-help-text"
      v-if="props.helpField === HelpTextField.Methods"
    >
      <Panel header="Allowed Methods">
        <p>
          How the data is accessed can be tightly controlled by defining which
          request methods are allowed for a given project. For a project to be
          able to read the data, the <code>GET</code> method must be enabled
          (and is by default).
        </p>
        <p>
          Additional request methods can be added to this list which would allow
          users of the project to modify (<code>PUT</code>) the data, add
          (<code>POST</code>) new data, or remove (<code>DELETE</code>) data in
          the server. The ability to modify the list of allowed request methods
          is disabled by default, though admins can enable this field, but
          should understand the risks of allowing users to directly modify the
          data on their institution's servers.
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <div
      class="methods-help-text"
      v-else-if="props.helpField === HelpTextField.Path"
    >
      <Panel header="Data Path">
        <p>
          Here, the admin must provide the absolute file path of the directory
          (folder) which contains the relevant data to be shared with the
          project. The path should be the same as defined on the server/host
          provided in the <i>Server</i> field.
        </p>
        <p>
          For Unix based systems, the directory path should start with a forward
          slash "/", while a Windows OS will use a drive letter with a colon and
          2 back slashes (e.g. H:\\).
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <div
      class="methods-help-text"
      v-else-if="props.helpField === HelpTextField.Port"
    >
      <Panel header="Server Port">
        <p>
          In order to maintain security, firewalls are used to prevent
          unauthorized access to professional and personal computers/servers. To
          gain access to services or data on a system with a firewall, a
          <i>port</i> must be opened by the technical administrator. These ports
          have numerical identifiers and your institution should have a specific
          port opened for the server containing the data to be shared.
        </p>
        <p>
          Please provide that port number here so that the FLAME Node Service is
          able to access the data. If you are unsure or do not know which port
          should be used, please contact your IT department or relevant
          administrator.
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <div
      class="methods-help-text"
      v-else-if="props.helpField === HelpTextField.Protocol"
    >
      <Panel header="Communication Protocol">
        <p>
          Multiple protocols exist for transferring files between computers and
          for communication, the most common being HTTP. To improve the security
          of the transferred data, <b>Transport Layer Security</b> (TLS) was
          developed for protocols as an encryption method and is now very
          commonly used (HTTPS is simply HTTP over TLS). The FLAME Node software
          needs to know the protocol used, and whether or not it is secured
          using TLS.
        </p>
        <ul>
          <li>
            <b>HTTP/HTTPS</b> - Hypertext Transfer Protocol. Data is generally
            sent using port 80 (HTTP) or port 443 (HTTPS)
          </li>
          <li><b>WS/WSS</b> - Websocket on HTTP (WS) or on HTTPS (WSS)</li>
          <li><b>gRPC/gRPCS</b> - Google remote procedural calls</li>
          <li><b>TCP/TLS</b> - Transmission Control Protocol</li>
          <li>
            <b>TCP Passthrough</b> - a TLS proxy request that doesn't terminate
            (a SNI proxy)
          </li>
        </ul>
        <p>
          For additional information, please visit
          <a
            href="https://docs.konghq.com/gateway/latest/how-kong-works/routing-traffic/"
            target="_blank"
            rel="noopener noreferrer"
          >
            the Kong documentation.
          </a>
        </p>
        <p>
          Should your institution use a different protocol other than those
          listed below, please contact the Node Dev Team for help resolving
          this.
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <div
      class="methods-help-text"
      v-else-if="props.helpField === HelpTextField.Server"
    >
      <Panel header="Server Host">
        <p>
          This field is for providing the <b>hostname</b> or
          <b>IP address</b> of the data's server. Please take care that this is
          reachable from outside of the network.
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <div
      class="methods-help-text"
      v-else-if="props.helpField === HelpTextField.Type"
    >
      <Panel header="Data Store Type">
        <p>
          Depending on how the data is made available, the FLAME Node software
          will have to setup specific plugins and features. It is important to
          indicate here in what type of instance the data is stored.
        </p>
        <p>
          Should your institution use a different method of storage other than
          those listed, please contact the Node Dev Team for help resolving
          this.
        </p>
        <template #icons>
          <button class="p-panel-header-icon p-link mr-2" @click="closeHelp">
            <span class="pi pi-times" />
          </button>
        </template>
      </Panel>
    </div>
    <p v-else>Foobar</p>
  </div>
</template>

<style scoped lang="scss"></style>
