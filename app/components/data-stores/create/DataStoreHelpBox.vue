<script setup lang="ts">
import { HelpTextField } from "~/components/data-stores/create/index";
import DataStoreHelpPanel from "~/components/data-stores/create/DataStoreHelpPanel.vue";

const props = defineProps<{ helpField: string | undefined }>();
const emit = defineEmits(["closeHelp"]);
</script>

<template>
  <div class="data-store-help">
    <DataStoreHelpPanel
      v-if="props.helpField === HelpTextField.Methods"
      header="Allowed Methods"
      @closeHelp="emit('closeHelp')"
    >
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
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.FHIR"
      header="Data Path"
      @closeHelp="emit('closeHelp')"
    >
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
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.S3"
      header="Bucket Name"
      @closeHelp="emit('closeHelp')"
    >
      <p>Enter the name of the S3 bucket which contains the data.</p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Port"
      header="Server Port"
      @closeHelp="emit('closeHelp')"
    >
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
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Protocol"
      header="Communication Protocol"
      @closeHelp="emit('closeHelp')"
    >
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
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Server"
      header="Server Host"
      @closeHelp="emit('closeHelp')"
    >
      <p>
        This field is for providing the <b>hostname</b> or
        <b>IP address</b> of the data's server. Please take care that this is
        reachable from outside of the network.
      </p>
    </DataStoreHelpPanel>

    <DataStoreHelpPanel
      v-else-if="props.helpField === HelpTextField.Type"
      header="Data Store Type"
      @closeHelp="emit('closeHelp')"
    >
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
    </DataStoreHelpPanel>
  </div>
</template>

<style scoped lang="scss"></style>
