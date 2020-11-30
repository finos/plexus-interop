namespace Plexus.Interop.Testing.Generated
{
    public sealed partial class UniqueId
    {
        public bool Equals(Plexus.UniqueId other)
        {
            if (Lo != other.Lo) return false;
            if (Hi != other.Hi) return false;
            return true;
        }

        public UniqueId(Plexus.UniqueId uniqueId)
        {
            Lo = uniqueId.Lo;
            Hi = uniqueId.Hi;
        }

        public static implicit operator UniqueId(Plexus.UniqueId uniqueId)
        {
            return new UniqueId(uniqueId);
        }
    }
}
